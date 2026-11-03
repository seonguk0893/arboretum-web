document.addEventListener("DOMContentLoaded", () => {
  const menuCards = document.querySelectorAll(".menu-card");

  menuCards.forEach((card) => {
    card.addEventListener("click", () => {
      const menu = card.dataset.menu;

      console.log(`선택된 메뉴: ${menu}`);
    });
  });

  const voiceButton = document.querySelector(".voice-button");

  if (voiceButton) {
    voiceButton.addEventListener("click", () => {
      console.log("음성 안내 버튼 클릭");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const ADMIN_PIN = "1234";

  /* =====================================================
     ELEMENTS
  ===================================================== */

  const adminButton = document.getElementById("adminButton");
  const adminModal = document.getElementById("adminModal");

  const pinStep = document.getElementById("pinStep");
  const modeStep = document.getElementById("modeStep");

  const closeAdminModal = document.getElementById("closeAdminModal");

  const closeModeModal = document.getElementById("closeModeModal");

  const pinDisplay = document.getElementById("pinDisplay");

  const pinError = document.getElementById("pinError");

  const pinClear = document.getElementById("pinClear");

  const pinConfirm = document.getElementById("pinConfirm");

  const modeStatus = document.getElementById("modeStatus");

  const selectedModeText = document.getElementById("selectedModeText");

  const modeSaveButton = document.getElementById("modeSaveButton");

  const modeOptions = document.querySelectorAll(".mode-option");

  const FALLBACK = {
    kioskMode: "키오스크 모드",
    driveMode: "주행 모드",
    pinWrong: "관리자 PIN이 올바르지 않습니다.",
  };
  const tr = (key) =>
    window.ArboretumI18n ? window.ArboretumI18n.t(key) : FALLBACK[key];

  /* =====================================================
     STATE
  ===================================================== */

  let enteredPin = "";

  let selectedMode = localStorage.getItem("robotMode") || "kiosk";

  /* =====================================================
     MODE UI
  ===================================================== */

  function updateModeUI(mode) {
    selectedMode = mode;
    const modeName = tr(mode === "drive" ? "driveMode" : "kioskMode");

    if (modeStatus) {
      modeStatus.textContent = modeName;
      modeStatus.classList.toggle("drive", mode === "drive");
    }

    modeOptions.forEach((option) => {
      option.classList.toggle("active", option.dataset.mode === mode);
    });

    if (selectedModeText) {
      selectedModeText.textContent = modeName;
    }
  }

  /* =====================================================
     PIN DISPLAY
  ===================================================== */

  function updatePinDisplay() {
    if (!pinDisplay) return;

    const dots = pinDisplay.querySelectorAll("span");

    dots.forEach((dot, index) => {
      dot.classList.toggle("filled", index < enteredPin.length);

      dot.classList.remove("error");
    });
  }

  /* =====================================================
     MODAL
  ===================================================== */

  function openAdminModal() {
    if (!adminModal) return;

    enteredPin = "";

    updatePinDisplay();

    if (pinError) {
      pinError.textContent = "";
    }

    if (pinStep) {
      pinStep.style.display = "block";
    }

    if (modeStep) {
      modeStep.style.display = "none";
    }

    adminModal.classList.add("active");

    document.body.classList.add("modal-open");
  }

  function closeModal() {
    if (!adminModal) return;

    adminModal.classList.remove("active");

    document.body.classList.remove("modal-open");

    enteredPin = "";

    updatePinDisplay();
  }

  /* =====================================================
     PIN INPUT
  ===================================================== */

  function inputPin(number) {
    if (enteredPin.length >= 4) {
      return;
    }

    enteredPin += number;

    if (pinError) {
      pinError.textContent = "";
    }

    updatePinDisplay();

    if (enteredPin.length === 4) {
      setTimeout(() => {
        checkPin();
      }, 150);
    }
  }

  /* =====================================================
     PIN CHECK
  ===================================================== */

  function checkPin() {
    if (enteredPin === ADMIN_PIN) {
      if (pinError) {
        pinError.textContent = "";
      }

      if (pinStep) {
        pinStep.style.display = "none";
      }

      if (modeStep) {
        modeStep.style.display = "block";
      }

      updateModeUI(selectedMode);
    } else {
      if (pinError) {
        pinError.textContent = tr("pinWrong");
      }

      if (pinDisplay) {
        const dots = pinDisplay.querySelectorAll("span");

        dots.forEach((dot) => {
          dot.classList.add("error");
        });
      }

      setTimeout(() => {
        enteredPin = "";

        updatePinDisplay();
      }, 500);
    }
  }

  /* =====================================================
     NUMERIC KEYPAD
  ===================================================== */

  document.querySelectorAll("[data-pin]").forEach((button) => {
    button.addEventListener("click", () => {
      inputPin(button.dataset.pin);
    });
  });

  /* =====================================================
     CLEAR
  ===================================================== */

  if (pinClear) {
    pinClear.addEventListener("click", () => {
      enteredPin = "";

      if (pinError) {
        pinError.textContent = "";
      }

      updatePinDisplay();
    });
  }

  /* =====================================================
     CONFIRM
  ===================================================== */

  if (pinConfirm) {
    pinConfirm.addEventListener("click", () => {
      checkPin();
    });
  }

  /* =====================================================
     MODE SELECT
  ===================================================== */

  modeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      updateModeUI(option.dataset.mode);
    });
  });

  /* =====================================================
     SAVE MODE
  ===================================================== */

  if (modeSaveButton) {
    modeSaveButton.addEventListener("click", () => {
      localStorage.setItem("robotMode", selectedMode);

      updateModeUI(selectedMode);

      closeModal();

      console.log("Robot mode changed:", selectedMode);
    });
  }

  /* =====================================================
     OPEN ADMIN
  ===================================================== */

  if (adminButton) {
    adminButton.addEventListener("click", openAdminModal);
  }

  /* =====================================================
     CLOSE
  ===================================================== */

  if (closeAdminModal) {
    closeAdminModal.addEventListener("click", closeModal);
  }

  if (closeModeModal) {
    closeModeModal.addEventListener("click", closeModal);
  }

  /* =====================================================
     BACKDROP
  ===================================================== */

  const backdrop = adminModal?.querySelector(".admin-modal-backdrop");

  if (backdrop) {
    backdrop.addEventListener("click", closeModal);
  }

  /* =====================================================
     ESC
  ===================================================== */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && adminModal?.classList.contains("active")) {
      closeModal();
    }
  });

  /* =====================================================
     INITIAL MODE
  ===================================================== */
  ["languagechange", "arboretum:languagechange"].forEach((name) => {
    window.addEventListener(name, () => {
      updateModeUI(selectedMode);
      if (pinError && pinError.textContent) {
        pinError.textContent = tr("pinWrong");
      }
    });
  });

  updateModeUI(selectedMode);
});
