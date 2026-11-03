function updateClock() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  document.getElementById("currentTime").textContent =
    `${hours}:${minutes}:${seconds}`;
}

updateClock();
setInterval(updateClock, 1000);

(() => {
  const LANGUAGE_KEY = "arboretum-language";
  const SUPPORTED_LANGUAGES = ["ko", "en", "ja", "zh"];

  function getSavedLanguage() {
    try {
      const saved = localStorage.getItem(LANGUAGE_KEY);

      return SUPPORTED_LANGUAGES.includes(saved) ? saved : "ko";
    } catch (error) {
      return "ko";
    }
  }

  function setLanguage(language) {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      language = "ko";
    }

    // 현재 페이지의 언어 설정
    document.documentElement.lang = language;

    // 다음 페이지에서도 선택 언어 유지
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.warn("언어 설정을 저장할 수 없습니다.", error);
    }

    // 다른 화면의 JavaScript에서도 사용할 수 있도록 이벤트 전달
    window.dispatchEvent(
      new CustomEvent("languagechange", {
        detail: { language },
      }),
    );
  }

  function initializeLanguageSelector() {
    const selector = document.getElementById("languageSelect");

    if (!selector) {
      return;
    }

    // 저장된 언어 적용
    selector.value = getSavedLanguage();
    setLanguage(selector.value);

    // 사용자가 언어를 변경한 경우
    selector.addEventListener("change", (event) => {
      setLanguage(event.target.value);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLanguageSelector);
  } else {
    initializeLanguageSelector();
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  const openButton = document.getElementById("surveyCardButton");
  const modal = document.getElementById("surveyModal");
  const closeButton = document.getElementById("surveyClose");
  const backdrop = document.getElementById("surveyBackdrop");
  const form = document.getElementById("surveyForm");

  // 설문 모달이 없는 페이지에서는 실행하지 않음
  if (!modal) return;

  function openSurvey() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeSurvey() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  openButton?.addEventListener("click", openSurvey);
  closeButton?.addEventListener("click", closeSurvey);
  backdrop?.addEventListener("click", closeSurvey);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeSurvey();
    }
  });

  // 설문 답변 저장
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      // 필수 항목 선택 여부 확인
      if (!form.reportValidity()) return;

      const submitButton = form.querySelector(".survey-submit");
      if (!submitButton || submitButton.disabled) return;

      const originalText = submitButton.textContent;

      const formData = new FormData(form);

      const answers = {
        satisfaction: Number(formData.get("satisfaction")),
        easy_to_understand: formData.get("easyToUnderstand"),
        reuse: formData.get("reuse"),
      };

      submitButton.disabled = true;
      submitButton.textContent = "저장 중...";

      try {
        const response = await fetch("/lobby/api/survey-responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(answers),
        });

        // JSON으로 바로 변환하지 않고 응답 원문부터 확인
        const responseText = await response.text();

        console.log("설문 요청 URL:", response.url);
        console.log("설문 응답 상태:", response.status);
        console.log("설문 응답 내용:", responseText);

        let result;

        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `서버가 JSON이 아닌 응답을 반환했습니다. ` +
              `HTTP ${response.status}, 응답: ${responseText.slice(0, 200)}`,
          );
        }

        if (!response.ok) {
          throw new Error(result.error || "설문 저장에 실패했습니다.");
        }

        alert("설문에 참여해 주셔서 감사합니다!");

        form.reset();
        closeSurvey();
      } catch (error) {
        console.error("설문 저장 오류:", error);

        alert(
          error.message ||
            "설문을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
        );
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalText;
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("voiceModal");

  // 이 페이지에 음성 모달이 없으면 실행하지 않음
  if (!modal) return;

  const openButtons = document.querySelectorAll("[data-voice-button]");
  const closeButtons = modal.querySelectorAll("[data-voice-close]");
  const startButton = document.getElementById("voiceStartButton");
  const status = document.getElementById("voiceStatus");
  const result = document.getElementById("voiceResult");
  const microphone = document.getElementById("voiceMicrophone");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const languageMap = {
    ko: "ko-KR",
    en: "en-US",
    ja: "ja-JP",
    zh: "zh-CN",
  };

  let recognition = null;
  let isListening = false;

  // 공통 다국어 함수 사용
  function translate(key) {
    if (window.ArboretumI18n && typeof window.ArboretumI18n.t === "function") {
      return window.ArboretumI18n.t(key);
    }

    return key;
  }

  // 현재 선택된 언어 확인
  function getCurrentLanguage() {
    const savedLanguage = localStorage.getItem("arboretum-language");
    return languageMap[savedLanguage] ? savedLanguage : "ko";
  }

  // 음성인식 언어 설정
  function getRecognitionLanguage() {
    return languageMap[getCurrentLanguage()] || "ko-KR";
  }

  function setStatus(key) {
    status.textContent = translate(key);
  }

  function setStartButtonText(key) {
    startButton.textContent = translate(key);
  }

  function resetMicrophone() {
    microphone.classList.remove("is-listening");
    isListening = false;
  }

  function openModal() {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (!SpeechRecognition) {
      setStatus("voiceUnsupported");
      startButton.disabled = true;
    } else {
      setStatus("voicePrompt");
      startButton.disabled = false;
      setStartButtonText("voiceStart");
    }
  }

  function closeModal() {
    if (recognition && isListening) {
      recognition.stop();
    }

    resetMicrophone();

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    startButton.disabled = false;
    setStartButtonText("voiceStart");
  }

  function startRecognition() {
    if (!SpeechRecognition) {
      setStatus("voiceUnsupported");
      return;
    }

    if (isListening) {
      recognition?.stop();
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = getRecognitionLanguage();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    result.textContent = "";
    setStatus("voiceListening");
    setStartButtonText("voiceStop");
    startButton.disabled = false;

    microphone.classList.add("is-listening");
    isListening = true;

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      result.textContent = transcript;
    };

    recognition.onerror = (event) => {
      const errorKeys = {
        "not-allowed": "voiceMicPermission",
        "no-speech": "voiceNoSpeech",
        "audio-capture": "voiceMicNotFound",
        network: "voiceNetworkError",
        "service-not-allowed": "voiceServiceBlocked",
      };

      const key = errorKeys[event.error];

      if (key) {
        setStatus(key);
      } else {
        // 알 수 없는 오류도 다국어 메시지로 표시
        status.textContent = `${translate("voiceRecognitionError")} (${event.error})`;
      }
    };

    recognition.onend = () => {
      resetMicrophone();
      startButton.disabled = false;

      setStartButtonText(
        result.textContent.trim() ? "voiceRetry" : "voiceStart",
      );

      if (result.textContent.trim()) {
        setStatus("voiceRecognized");
      } else if (status.textContent === translate("voiceListening")) {
        setStatus("voiceEnded");
      }
    };

    try {
      recognition.start();
    } catch (error) {
      resetMicrophone();
      startButton.disabled = false;
      setStartButtonText("voiceRetry");
      setStatus("voiceStartFailed");

      console.error("음성인식 시작 오류:", error);
    }
  }

  openButtons.forEach((button) => {
    button.addEventListener("click", openModal);
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  startButton.addEventListener("click", startRecognition);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
});
