(() => {
  const page = document.querySelector(".greenhouse-page");
  const translate = (key, fallback) => window.ArboretumI18n?.t(key) || fallback;

  // ==========================================
  // 포토존 카드
  // ==========================================

  const photoCardButton = document.getElementById("photoCardButton");

  // ==========================================
  // 카메라 모달
  // ==========================================

  const modal = document.getElementById("cameraModal");
  const video = document.getElementById("cameraVideo");
  const preview = document.getElementById("capturedImage");
  const message = document.getElementById("cameraMessage");
  const photoFrame = document.getElementById("photoFrame");

  // ==========================================
  // 카메라 버튼
  // ==========================================

  const shutterButton = document.getElementById("cameraShutter");
  const retakeButton = document.getElementById("cameraRetake");
  const saveButton = document.getElementById("cameraSave");

  // ==========================================
  // 상태
  // ==========================================

  let stream = null;
  let photoDataUrl = null;

  let selectedFrame = "frame1";
  let selectedFrameImage = null;

  // 카운트다운 상태
  let isCountingDown = false;
  let captureSequence = 0;

  const getFramePath = (frameName) => {
    return `/static/images/frames/${frameName}.png`;
  };

  const loadFrameImage = (frameName) => {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(new Error(`프레임을 불러올 수 없습니다: ${frameName}`));
      };

      image.src = getFramePath(frameName);
    });
  };

  // ==========================================
  // 대기 함수
  // ==========================================

  const wait = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  };

  // ==========================================
  // 카운트다운 표시
  // ==========================================

  const showCountdown = (number) => {
    if (!message) {
      return;
    }

    message.hidden = false;
    message.textContent = number;

    // 기존 cameraMessage 스타일을 최대한 유지하면서
    // 숫자가 크게 보이도록 설정
    message.style.fontSize = "clamp(70px, 10vw, 140px)";
    message.style.fontWeight = "800";
    message.style.lineHeight = "1";
    message.style.textAlign = "center";
  };

  // ==========================================
  // 카운트다운 종료
  // ==========================================

  const hideCountdown = () => {
    if (!message) {
      return;
    }

    message.hidden = true;
    message.textContent = "";

    message.style.fontSize = "";
    message.style.fontWeight = "";
    message.style.lineHeight = "";
    message.style.textAlign = "";
  };

  // ==========================================
  // 카메라 종료
  // ==========================================

  const stopCamera = () => {
    // 진행 중인 카운트다운 무효화
    captureSequence++;

    isCountingDown = false;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });

      stream = null;
    }

    if (video) {
      video.srcObject = null;
    }

    if (shutterButton) {
      shutterButton.disabled = false;
    }

    hideCountdown();
  };

  // ==========================================
  // 미리보기 초기화
  // ==========================================

  const resetPreview = () => {
    // 기존 카운트다운 무효화
    captureSequence++;
    isCountingDown = false;

    if (preview) {
      preview.removeAttribute("src");
      preview.style.display = "none";
    }

    if (video) {
      video.style.display = "block";
    }

    if (photoFrame) {
      photoFrame.style.display = "block";
    }

    if (shutterButton) {
      shutterButton.hidden = false;
      shutterButton.disabled = false;
    }

    if (retakeButton) {
      retakeButton.hidden = true;
    }

    if (saveButton) {
      saveButton.hidden = true;
    }

    photoDataUrl = null;

    hideCountdown();
  };

  // ==========================================
  // 프레임 선택
  // ==========================================

  const selectFrame = async (frameName) => {
    if (!frameName) {
      frameName = "frame1";
    }

    selectedFrame = frameName;

    // 선택 상태 표시
    document.querySelectorAll(".frame-option").forEach((option) => {
      option.classList.toggle("active", option.dataset.frame === frameName);
    });

    try {
      // 프레임 이미지 로딩
      selectedFrameImage = await loadFrameImage(frameName);

      // 카메라 위에 프레임 표시
      if (photoFrame) {
        photoFrame.src = selectedFrameImage.src;
        photoFrame.style.display = "block";
      }
    } catch (error) {
      console.error("Frame loading error:", error);
    }
  };

  // ==========================================
  // 이미지 로딩
  // ==========================================

  const loadImage = (src) => {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        resolve(image);
      };

      image.onerror = () => {
        reject(new Error(`이미지를 불러올 수 없습니다: ${src}`));
      };

      image.src = src;
    });
  };

  // ==========================================
  // 최종 사진 생성
  // ==========================================

  const createFinalPhoto = async () => {
    if (!video || !video.videoWidth || !video.videoHeight) {
      return null;
    }

    // 프레임 이미지가 없으면 현재 선택된 프레임 로딩
    if (!selectedFrameImage) {
      selectedFrameImage = await loadFrameImage(selectedFrame);
    }

    if (
      !selectedFrameImage ||
      !selectedFrameImage.naturalWidth ||
      !selectedFrameImage.naturalHeight
    ) {
      return null;
    }

    // ==========================================
    // 최종 사진 비율
    // 카메라 viewfinder와 동일하게 3:4 사용
    // ==========================================

    const PHOTO_RATIO = 3 / 4;

    // 세로 1600px 기준
    const canvasHeight = 1600;
    const canvasWidth = Math.round(canvasHeight * PHOTO_RATIO);

    const canvas = document.createElement("canvas");

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    // 이미지 품질
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";

    // ==========================================
    // 1. 카메라 영상
    // ==========================================

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    const videoRatio = videoWidth / videoHeight;

    let sourceWidth;
    let sourceHeight;
    let sourceX;
    let sourceY;

    // CSS의 object-fit: cover와 동일하게
    // 3:4 영역에 맞춰 중앙 기준으로 crop
    if (videoRatio > PHOTO_RATIO) {
      // 카메라 영상이 더 가로로 넓음
      // 좌우를 잘라냄

      sourceHeight = videoHeight;
      sourceWidth = videoHeight * PHOTO_RATIO;

      sourceX = (videoWidth - sourceWidth) / 2;
      sourceY = 0;
    } else {
      // 카메라 영상이 3:4보다 세로로 김
      // 위아래를 잘라냄

      sourceWidth = videoWidth;
      sourceHeight = videoWidth / PHOTO_RATIO;

      sourceX = 0;
      sourceY = (videoHeight - sourceHeight) / 2;
    }

    // ==========================================
    // 좌우 반전
    // 실시간 카메라와 동일하게 미러링
    // ==========================================

    context.save();

    context.translate(canvasWidth, 0);
    context.scale(-1, 1);

    context.drawImage(
      video,

      // 원본 영상에서 가져올 영역
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,

      // Canvas 전체에 출력
      0,
      0,
      canvasWidth,
      canvasHeight,
    );

    context.restore();

    // ==========================================
    // 2. 선택한 프레임 합성
    // ==========================================

    context.drawImage(selectedFrameImage, 0, 0, canvasWidth, canvasHeight);

    // ==========================================
    // 3. 최종 JPG 생성
    // ==========================================

    return canvas.toDataURL("image/jpeg", 0.94);
  };

  // ==========================================
  // 카메라 시작
  // ==========================================

  const startCamera = async () => {
    resetPreview();

    if (!message || !video) {
      return;
    }

    message.hidden = false;
    message.textContent = translate(
      "cameraPreparing",
      "카메라를 준비하고 있어요.",
    );

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("CAMERA_NOT_SUPPORTED");
      }

      stopCamera();

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },

        audio: false,
      });

      video.srcObject = stream;

      await video.play();

      // 프레임 표시
      if (photoFrame) {
        photoFrame.style.display = "block";
      }

      // 선택 프레임이 없으면 기본 frame1
      if (!selectedFrameImage) {
        selectedFrameImage = await loadFrameImage(selectedFrame);
      }

      if (photoFrame) {
        photoFrame.src = selectedFrameImage.src;
      }

      message.hidden = true;
    } catch (error) {
      console.error("Camera error:", error);

      message.hidden = false;
      message.textContent = translate(
        "cameraDenied",
        "카메라 권한을 허용한 뒤 다시 시도해 주세요.",
      );

      stopCamera();
    }
  };

  // ==========================================
  // 카메라 모달 열기
  // ==========================================

  const openCamera = () => {
    if (!modal) {
      return;
    }

    // 로봇 이동 중 촬영 금지
    if (page?.dataset.robotState === "moving") {
      return;
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    selectFrame(selectedFrame);
    startCamera();
  };

  // ==========================================
  // 카메라 모달 닫기
  // ==========================================

  const closeCamera = () => {
    if (!modal) {
      return;
    }

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");

    stopCamera();
  };

  // ==========================================
  // 사진 촬영
  // ==========================================

  const capturePhoto = async () => {
    if (isCountingDown || !stream || !video || !video.videoWidth) {
      return;
    }

    // 이번 촬영에 고유 번호 부여
    const currentCaptureSequence = ++captureSequence;

    isCountingDown = true;

    // 촬영 버튼 잠금
    if (shutterButton) {
      shutterButton.disabled = true;
    }

    try {
      // ======================================
      // 3
      // ======================================

      showCountdown("3");

      await wait(1000);

      // 모달이 닫혔거나 다른 촬영이 시작되었다면 중단
      if (
        currentCaptureSequence !== captureSequence ||
        !modal?.classList.contains("active")
      ) {
        return;
      }

      // ======================================
      // 2
      // ======================================

      showCountdown("2");

      await wait(1000);

      if (
        currentCaptureSequence !== captureSequence ||
        !modal?.classList.contains("active")
      ) {
        return;
      }

      // ======================================
      // 1
      // ======================================

      showCountdown("1");

      await wait(1000);

      if (
        currentCaptureSequence !== captureSequence ||
        !modal?.classList.contains("active")
      ) {
        return;
      }

      if (
        currentCaptureSequence !== captureSequence ||
        !modal?.classList.contains("active")
      ) {
        return;
      }

      // ======================================
      // 실제 사진 생성
      // ======================================

      if (message) {
        message.hidden = false;
        message.textContent = translate(
          "cameraPreparing",
          "사진을 만들고 있어요.",
        );
      }

      const finalPhoto = await createFinalPhoto();

      if (!finalPhoto) {
        return;
      }

      photoDataUrl = finalPhoto;

      // ======================================
      // 최종 이미지 표시
      // ======================================

      if (preview) {
        preview.src = photoDataUrl;
        preview.style.display = "block";
      }

      // 카메라 프레임 숨기기
      if (photoFrame) {
        photoFrame.style.display = "none";
      }

      // 카메라 영상 숨기기
      if (video) {
        video.style.display = "none";
      }

      hideCountdown();

      // 촬영 버튼 숨김
      if (shutterButton) {
        shutterButton.hidden = true;
        shutterButton.disabled = false;
      }

      // 다시 촬영 버튼 표시
      if (retakeButton) {
        retakeButton.hidden = false;
      }

      // 저장 버튼 표시
      if (saveButton) {
        saveButton.hidden = false;
      }
    } catch (error) {
      console.error("Photo creation error:", error);

      hideCountdown();

      if (message) {
        message.hidden = false;
        message.textContent = translate(
          "captureError",
          "사진을 만드는 중 문제가 발생했어요.",
        );
      }
    } finally {
      isCountingDown = false;

      if (shutterButton && !shutterButton.hidden) {
        shutterButton.disabled = false;
      }
    }
  };

  // ==========================================
  // 프레임 선택 이벤트
  // ==========================================

  document.querySelectorAll(".frame-option").forEach((option) => {
    option.addEventListener("click", async () => {
      const frameName = option.dataset.frame;

      if (!frameName) {
        return;
      }

      await selectFrame(frameName);
    });
  });

  // ==========================================
  // 포토존 카드
  // ==========================================

  photoCardButton?.addEventListener("click", openCamera);

  // ==========================================
  // 모달 닫기
  // ==========================================

  document.querySelectorAll("[data-close-camera]").forEach((button) => {
    button.addEventListener("click", closeCamera);
  });

  // 닫기 버튼
  document
    .getElementById("cameraClose")
    ?.addEventListener("click", closeCamera);

  // ==========================================
  // 촬영
  // ==========================================

  shutterButton?.addEventListener("click", capturePhoto);

  // ==========================================
  // 다시 촬영
  // ==========================================

  retakeButton?.addEventListener("click", () => {
    // 진행 중인 카운트다운 무효화
    captureSequence++;
    isCountingDown = false;

    // 최종 사진 숨김
    if (preview) {
      preview.removeAttribute("src");
      preview.style.display = "none";
    }

    // 카메라 다시 표시
    if (video) {
      video.style.display = "block";
    }

    // 프레임 다시 표시
    if (photoFrame) {
      photoFrame.style.display = "block";
    }

    // 기존 상태 초기화
    photoDataUrl = null;

    if (shutterButton) {
      shutterButton.hidden = false;
      shutterButton.disabled = false;
    }

    if (retakeButton) {
      retakeButton.hidden = true;
    }

    if (saveButton) {
      saveButton.hidden = true;
    }

    hideCountdown();

    // 카메라 다시 시작
    startCamera();
  });

  // ==========================================
  // 사진 저장 → 서버 업로드 → QR 표시
  // ==========================================

  const photoQrModal = document.getElementById("photoQrModal");
  const photoQrCode = document.getElementById("photoQrCode");
  const photoQrMessage = document.getElementById("photoQrMessage");

  const photoQrClose = document.getElementById("photoQrClose");
  const photoQrDone = document.getElementById("photoQrDone");
  const photoQrBackdrop = document.getElementById("photoQrBackdrop");

  let isUploadingPhoto = false;

  // QR 모달 열기
  const openPhotoQrModal = () => {
    if (!photoQrModal) {
      return;
    }

    photoQrModal.classList.add("active");
    photoQrModal.setAttribute("aria-hidden", "false");
  };

  // QR 모달 닫기
  const closePhotoQrModal = () => {
    if (!photoQrModal) {
      return;
    }

    photoQrModal.classList.remove("active");
    photoQrModal.setAttribute("aria-hidden", "true");
  };

  // QR 코드 초기화 및 생성
  const renderPhotoQrCode = (downloadUrl) => {
    if (!photoQrCode) {
      throw new Error("QR 코드 표시 영역을 찾을 수 없습니다.");
    }

    if (typeof QRCode === "undefined") {
      throw new Error(
        "QR 코드 라이브러리를 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.",
      );
    }

    // 이전 QR 코드 제거
    photoQrCode.replaceChildren();

    new QRCode(photoQrCode, {
      text: downloadUrl,
      width: 230,
      height: 230,
      colorDark: "#183b2b",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M,
    });
  };

  // 사진 업로드 및 QR 생성
  const uploadPhotoAndShowQr = async () => {
    if (!photoDataUrl || isUploadingPhoto) {
      return;
    }

    if (!saveButton) {
      return;
    }

    isUploadingPhoto = true;
    saveButton.disabled = true;

    if (photoQrCode) {
      photoQrCode.replaceChildren();
    }

    if (photoQrMessage) {
      photoQrMessage.textContent = "사진을 저장하고 있습니다.";
    }

    openPhotoQrModal();

    try {
      const response = await fetch("/greenhouse/api/photo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          photo: photoDataUrl,
          frame: selectedFrame,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        throw new Error(result.message || "사진 저장에 실패했습니다.");
      }

      if (!result.download_url) {
        throw new Error("사진 다운로드 주소를 받지 못했습니다.");
      }

      // 사진 다운로드 주소로 QR 생성
      renderPhotoQrCode(result.download_url);

      if (photoQrMessage) {
        photoQrMessage.textContent = "";
      }
    } catch (error) {
      console.error("Photo upload / QR error:", error);

      if (photoQrCode) {
        photoQrCode.replaceChildren();
      }

      if (photoQrMessage) {
        photoQrMessage.textContent =
          error.message ||
          "사진 저장 중 문제가 발생했습니다. 다시 시도해 주세요.";
      }
    } finally {
      isUploadingPhoto = false;
      saveButton.disabled = false;
    }
  };

  // 사진 저장 버튼
  saveButton?.addEventListener("click", uploadPhotoAndShowQr);

  // QR 모달 닫기 버튼
  photoQrClose?.addEventListener("click", closePhotoQrModal);
  photoQrDone?.addEventListener("click", closePhotoQrModal);
  photoQrBackdrop?.addEventListener("click", closePhotoQrModal);

  // ESC 키로 QR 모달 닫기
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && photoQrModal?.classList.contains("active")) {
      closePhotoQrModal();
    }
  });

  // ==========================================
  // ESC로 닫기
  // ==========================================

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("active")) {
      closeCamera();
    }
  });

  // ==========================================
  // 로봇 상태
  // ==========================================

  window.setGreenhouseRobotState = (state) => {
    if (!page) {
      return;
    }

    page.dataset.robotState = state;

    const moving = state === "moving";

    if (photoCardButton) {
      photoCardButton.disabled = moving;
    }

    if (moving) {
      closeCamera();
    }
  };
})();
