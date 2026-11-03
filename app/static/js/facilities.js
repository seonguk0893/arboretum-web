(() => {
  const modal = document.getElementById("facilityModal");
  const marker = document.getElementById("facilityMarker");
  const selectedName = document.getElementById("selectedFacilityName");
  const status = document.getElementById("facilityRequestStatus");
  const guideButton = document.getElementById("guideFacility");
  const cancelButton = document.getElementById("cancelFacility");

  const confirmModal = document.getElementById("guideConfirmModal");
  const confirmDestination = document.getElementById("guideConfirmDestination");
  const cancelConfirmButton = document.getElementById("cancelGuideConfirm");
  const confirmStartButton = document.getElementById("confirmGuideStart");

  const movingModal = document.getElementById("robotMovingModal");
  const cancelMovingButton = document.getElementById("cancelRobotMoving");

  let selectedKey = null;
  let previousFocus = null;
  let pendingRequest = null;

  const t = (key) => window.ArboretumI18n?.t(key) || key;

  function renderFacilityLabels() {
    document.querySelectorAll("[data-facility-label]").forEach((element) => {
      element.textContent = t(element.dataset.facilityLabel);
    });

    document.querySelectorAll(".facility-choice").forEach((button) => {
      const key = button.dataset.facility;
      const nameText = button.querySelector(".facility-name-text");

      if (nameText && key) {
        const translated = t(key);
        nameText.textContent =
          translated !== key ? translated : button.dataset.name;
      }
    });

    if (selectedKey && selectedName) {
      const translated = t(selectedKey);

      if (translated !== selectedKey) {
        selectedName.textContent = translated;
      }
    }

    if (confirmModal?.classList.contains("is-open")) {
      updateConfirmDestination();
    }

    if (modal?.classList.contains("is-open") && status) {
      status.textContent = "";
    }
  }

  function getFacilityLabel() {
    if (!selectedKey) return "";

    const translated = t(selectedKey);

    return translated !== selectedKey
      ? translated
      : selectedName?.textContent || selectedKey;
  }

  function updateConfirmDestination() {
    if (confirmDestination) {
      confirmDestination.textContent = getFacilityLabel();
    }
  }

  function openFacility(key, button) {
    if (!modal) return;

    selectedKey = key;
    previousFocus = button || document.activeElement;

    const translatedName = t(key);
    const customName =
      translatedName !== key ? translatedName : button?.dataset.name || key;

    const descKey = `desc_${key}`;
    const translatedDesc = t(descKey);
    const customDesc =
      translatedDesc !== descKey
        ? translatedDesc
        : button?.dataset.description || "";

    const coordX = button?.dataset.x ? parseFloat(button.dataset.x) : 50;

    const coordY = button?.dataset.y ? parseFloat(button.dataset.y) : 50;

    if (selectedName) {
      selectedName.textContent = customName;
      selectedName.dataset.key = key;
    }

    const descElement = document.getElementById("facilityDescText");

    if (descElement) {
      descElement.textContent = customDesc;
      descElement.dataset.descKey = descKey;
    }

    if (status) {
      status.textContent = "";
      status.hidden = true;
    }

    if (marker) {
      marker.style.left = `${coordX}%`;
      marker.style.top = `${coordY}%`;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    cancelButton?.focus();
  }

  function closeFacilityModal(restoreFocus = true) {
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    if (restoreFocus && previousFocus?.focus) {
      previousFocus.focus();
    }
  }

  // 1단계: 기존 시설 선택 모달에서 안내하기를 누르면
  // 실제 이동 요청을 보내지 않고 최종 확인 창만 연다.
  function openConfirmModal() {
    if (!selectedKey || !confirmModal) return;

    updateConfirmDestination();

    confirmModal.classList.add("is-open");
    confirmModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    confirmStartButton?.focus();
  }

  function closeConfirmModal() {
    if (!confirmModal) return;

    confirmModal.classList.remove("is-open");
    confirmModal.setAttribute("aria-hidden", "true");

    // 시설 선택 모달이 아직 열려 있으므로 스크롤 잠금은 유지한다.
    if (modal?.classList.contains("is-open")) {
      document.body.style.overflow = "hidden";
      guideButton?.focus();
    } else {
      document.body.style.overflow = "";
    }
  }

  // 2단계: 사용자가 최종 확인했을 때만 안내 요청을 전달한다.
  function startGuide() {
    if (!selectedKey || !confirmModal) return;

    const request = {
      facility: selectedKey,
      label: getFacilityLabel(),
      source:
        document.querySelector(".facilities-page")?.dataset.source || "unknown",
      requestedAt: new Date().toISOString(),
    };

    pendingRequest = request;

    try {
      localStorage.setItem("pendingFacilityGuide", JSON.stringify(request));
    } catch (error) {
      console.warn("Could not save facility guide request", error);
    }

    closeConfirmModal();
    closeFacilityModal(false);

    // 이동 중 화면을 먼저 보여준다.
    if (movingModal) {
      movingModal.classList.add("is-open");
      movingModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      cancelMovingButton?.focus();
    }

    // 주의: 이벤트를 받을 실제 로봇 제어 시스템이 있어야 이동 명령이 실행된다.
    window.dispatchEvent(
      new CustomEvent("robot:guide-request", {
        detail: request,
      }),
    );
  }

  // 3단계: 이동 화면 취소.
  // 현재는 UI와 브라우저에 저장된 요청만 정리한다.
  // 실제 로봇 정지는 별도의 로봇 정지 API 연결이 필요하다.
  function cancelMoving() {
    if (!movingModal) return;

    movingModal.classList.remove("is-open");
    movingModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    try {
      const saved = localStorage.getItem("pendingFacilityGuide");

      if (saved && pendingRequest) {
        const parsed = JSON.parse(saved);

        if (parsed.requestedAt === pendingRequest.requestedAt) {
          localStorage.removeItem("pendingFacilityGuide");
        }
      }
    } catch (error) {
      console.warn("Could not clear facility guide request", error);
    }

    pendingRequest = null;
    selectedKey = null;

    // 취소 후 시설 목록으로 돌아간다.
    previousFocus?.focus?.();
  }

  document.querySelectorAll("[data-facility]").forEach((button) => {
    button.addEventListener("click", () => {
      openFacility(button.dataset.facility, button);
    });
  });

  document.querySelectorAll("[data-close-facility]").forEach((button) => {
    button.addEventListener("click", () => closeFacilityModal());
  });

  cancelButton?.addEventListener("click", () => closeFacilityModal());

  // 기존 안내하기 버튼은 확인 창을 여는 역할만 한다.
  guideButton?.addEventListener("click", openConfirmModal);

  cancelConfirmButton?.addEventListener("click", closeConfirmModal);
  confirmStartButton?.addEventListener("click", startGuide);
  cancelMovingButton?.addEventListener("click", cancelMoving);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    // 이동 중에는 Escape로 전체 화면을 닫지 못하게 한다.
    if (movingModal?.classList.contains("is-open")) {
      event.preventDefault();
      return;
    }

    if (confirmModal?.classList.contains("is-open")) {
      closeConfirmModal();
      return;
    }

    if (modal?.classList.contains("is-open")) {
      closeFacilityModal();
    }
  });

  window.addEventListener("languagechange", renderFacilityLabels);
  document.addEventListener("DOMContentLoaded", renderFacilityLabels);

  renderFacilityLabels();
})();
