(() => {
  "use strict";

  const API_URL = "/greenhouse/api/exhibitions";
  const TTS_API_URL = "/greenhouse/api/tts";
  const SUPPORTED_LANGUAGES = ["ko", "en", "ja", "zh"];

  const $ = (id) => document.getElementById(id);

  const elements = {
    start: $("exhibitionStart"),
    zoneSelect: $("zoneSelectView"),
    viewer: $("exhibitionViewer"),
    list: $("exhibitionList"),

    startButton: $("startExhibitionButton"),
    backToStartButton: $("backToStartButton"),
    zoneButtons: document.querySelectorAll(".zone-select-button"),

    previousButton: $("previousButton"),
    nextButton: $("nextButton"),
    listButton: $("listButton"),
    backToViewerButton: $("backToViewerButton"),
    backToZoneButton: $("backToZoneButton"),

    languageSelect: $("languageSelect"),

    progressText: $("progressText"),
    progressBar: $("progressBar"),
    currentSectionLabel: $("currentSectionLabel"),

    contentBadge: $("contentBadge"),
    contentTitle: $("contentTitle"),
    contentSubtitle: $("contentSubtitle"),
    contentImage: $("contentImage"),
    imageFallback: $("imageFallback"),
    fallbackText: $("fallbackText"),
    regionLabel: $("regionLabel"),

    contentKeyMessage: $("contentKeyMessage"),
    contentBody: $("contentBody"),
    contentHighlights: $("contentHighlights"),
    highlightList: $("highlightList"),

    audio: $("exhibitionAudio"),
    audioPlayButton: $("audioPlayButton"),
    audioStopButton: $("audioStopButton"),
    audioStatus: $("audioStatus"),

    sectionCardList: $("sectionCardList"),
    listTitle: $("listTitle"),
    listDescription: $("listDescription"),
  };

  // 전체 API 콘텐츠
  let contents = [];

  // 현재 선택한 구역 콘텐츠
  let activeContents = [];

  // 현재 콘텐츠 인덱스
  let currentIndex = 0;

  // 현재 선택 구역
  let selectedZone = null;

  let currentLanguage = "ko";
  let currentView = "start";

  let audioObjectUrl = null;
  let isGeneratingAudio = false;
  let audioRequestId = 0;

  /*
   * 언어별 값 조회
   */
  function getLocalizedValue(value, language = currentLanguage) {
    if (value == null) return "";

    if (typeof value === "string") return value;

    if (typeof value === "object" && !Array.isArray(value)) {
      return value[language] || value.ko || "";
    }

    return "";
  }

  function getLocalizedArray(value, language = currentLanguage) {
    if (!value) return [];

    if (Array.isArray(value)) return value;

    if (typeof value === "object") {
      const localized = value[language] || value.ko || [];

      return Array.isArray(localized) ? localized : [];
    }

    return [];
  }

  function getText(content, field) {
    return getLocalizedValue(content[field], currentLanguage);
  }

  /*
   * API 콘텐츠 정규화
   */
  function normalizeContent(item) {
    const zoneNo = item.zoneNo ?? item.zone_no ?? null;

    return {
      ...item,

      code: item.code || "",
      type: item.type || item.content_type || "",

      zoneNo: zoneNo == null ? null : Number(zoneNo),

      order: item.order ?? item.sort_order ?? 0,

      badge:
        item.badge ||
        (zoneNo != null
          ? `ZONE ${String(zoneNo).padStart(2, "0")}`
          : (item.code || "").toUpperCase()),

      title: item.title || {},
      subtitle: item.subtitle || {},

      keyMessage: item.keyMessage ?? item.key_message ?? {},

      body: item.body || [],
      highlights: item.highlights || [],

      image: item.image || item.image_url || "",

      region: item.region ?? item.regionLabel ?? item.region_label ?? "",

      audio: item.audio || item.audio_url || null,
    };
  }

  /*
   * 화면 전환
   */
  function setView(view) {
    currentView = view;

    elements.start.hidden = view !== "start";
    elements.zoneSelect.hidden = view !== "zoneSelect";
    elements.viewer.hidden = view !== "viewer";
    elements.list.hidden = view !== "list";
  }

  /*
   * 구역별 콘텐츠 필터링
   */
  function getZoneContents(zoneNo) {
    return contents
      .filter((content) => Number(content.zoneNo) === Number(zoneNo))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /*
   * 구역 선택
   */
  function selectZone(zoneNo) {
    const zoneContents = getZoneContents(zoneNo);

    if (!zoneContents.length) {
      alert(`ZONE ${zoneNo}에 등록된 전시 콘텐츠가 없습니다.`);
      return;
    }

    stopAudio();

    selectedZone = Number(zoneNo);
    activeContents = zoneContents;
    currentIndex = 0;

    renderContent(0);
  }

  /*
   * 구역 선택 화면으로 이동
   */
  function openZoneSelect() {
    stopAudio();
    setView("zoneSelect");
  }

  /*
   * 시작 화면으로 이동
   */
  function openStart() {
    stopAudio();

    selectedZone = null;
    activeContents = [];
    currentIndex = 0;

    setView("start");
  }

  /*
   * 음성 정리
   */
  function stopAudio() {
    audioRequestId += 1;
    isGeneratingAudio = false;

    if (!elements.audio) return;

    elements.audio.pause();
    elements.audio.removeAttribute("src");
    elements.audio.load();

    if (audioObjectUrl) {
      URL.revokeObjectURL(audioObjectUrl);
      audioObjectUrl = null;
    }

    elements.audioPlayButton.disabled = false;
    elements.audioPlayButton.textContent = "▶ 음성 듣기";

    elements.audioStatus.textContent = "음성 재생이 중지되었습니다.";
  }

  /*
   * 본문 렌더링
   */
  function renderBody(body) {
    elements.contentBody.replaceChildren();

    body.forEach((paragraph) => {
      const p = document.createElement("p");

      p.textContent = paragraph;

      elements.contentBody.appendChild(p);
    });
  }

  /*
   * 함께 알아보기 렌더링
   */
  function renderHighlights(highlights) {
    elements.highlightList.replaceChildren();

    if (!highlights.length) {
      elements.contentHighlights.hidden = true;
      return;
    }

    elements.contentHighlights.hidden = false;

    highlights.forEach((item) => {
      const li = document.createElement("li");

      li.textContent = item;

      elements.highlightList.appendChild(li);
    });
  }

  /*
   * 이미지 렌더링
   */
  function renderImage(content, title) {
    const imageUrl = content.image;

    if (!imageUrl) {
      elements.contentImage.hidden = true;
      elements.imageFallback.hidden = false;
      elements.fallbackText.textContent = title;

      return;
    }

    elements.contentImage.hidden = false;
    elements.imageFallback.hidden = true;

    elements.contentImage.alt = title;

    elements.contentImage.onerror = () => {
      elements.contentImage.hidden = true;
      elements.imageFallback.hidden = false;
      elements.fallbackText.textContent = title;
    };

    elements.contentImage.src = imageUrl;
  }

  /*
   * 현재 전시 콘텐츠 렌더링
   */
  function renderContent(index) {
    if (!activeContents.length) return;

    if (index < 0 || index >= activeContents.length) return;

    currentIndex = index;

    const content = activeContents[currentIndex];

    stopAudio();

    const title = getText(content, "title");
    const subtitle = getText(content, "subtitle");
    const keyMessage = getText(content, "keyMessage");

    const body = getLocalizedArray(content.body, currentLanguage);

    const highlights = getLocalizedArray(content.highlights, currentLanguage);

    const region = getLocalizedValue(content.region, currentLanguage);

    const zoneLabel = `ZONE ${selectedZone}`;

    elements.contentBadge.textContent = content.badge || zoneLabel;

    elements.currentSectionLabel.textContent = zoneLabel;

    elements.contentTitle.textContent = title;
    elements.contentSubtitle.textContent = subtitle;
    elements.contentKeyMessage.textContent = keyMessage;

    renderBody(body);
    renderImage(content, title);
    renderHighlights(highlights);

    if (region) {
      elements.regionLabel.hidden = false;
      elements.regionLabel.textContent = region;
    } else {
      elements.regionLabel.hidden = true;
    }

    // 선택한 구역 내 진행률
    const total = activeContents.length;
    const current = currentIndex + 1;
    const progress = (current / total) * 100;

    elements.progressText.textContent = `${current} / ${total}`;
    elements.progressBar.style.width = `${progress}%`;

    elements.previousButton.disabled = currentIndex === 0;

    elements.nextButton.disabled = false;

    if (currentIndex === total - 1) {
      elements.nextButton.innerHTML = "<span>완료</span><span>✓</span>";
    } else {
      elements.nextButton.innerHTML = "<span>다음</span><span>→</span>";
    }

    setView("viewer");
  }

  /*
   * 현재 구역의 전시 목차
   */
  function renderSectionList() {
    elements.sectionCardList.replaceChildren();

    if (!activeContents.length) return;

    elements.listTitle.textContent = `ZONE ${selectedZone} 전시해설 목차`;

    elements.listDescription.textContent =
      "원하는 전시 콘텐츠를 선택해 해설을 들을 수 있습니다.";

    activeContents.forEach((content, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className = "section-card";

      const number = document.createElement("span");

      number.className = "section-card-number";
      number.textContent = String(index + 1).padStart(2, "0");

      const textWrapper = document.createElement("span");

      textWrapper.className = "section-card-text";

      const title = document.createElement("strong");

      title.className = "section-card-title";
      title.textContent = getText(content, "title");

      const subtitle = document.createElement("small");

      subtitle.className = "section-card-description";
      subtitle.textContent = getText(content, "subtitle");

      textWrapper.append(title, subtitle);
      button.append(number, textWrapper);

      button.addEventListener("click", () => {
        renderContent(index);
      });

      elements.sectionCardList.appendChild(button);
    });
  }

  /*
   * Supabase 전시 콘텐츠 조회
   */
  async function loadContents(language) {
    currentLanguage = SUPPORTED_LANGUAGES.includes(language) ? language : "ko";

    try {
      const response = await fetch(
        `${API_URL}?language=${encodeURIComponent(currentLanguage)}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || `API 오류: ${response.status}`);
      }

      const apiContents = Array.isArray(result) ? result : result.contents;

      if (!Array.isArray(apiContents) || !apiContents.length) {
        throw new Error("등록된 전시 콘텐츠가 없습니다.");
      }

      contents = apiContents
        .map(normalizeContent)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      // 현재 선택 구역이 있다면 새 언어 데이터로 다시 필터링
      if (selectedZone !== null) {
        activeContents = getZoneContents(selectedZone);

        renderSectionList();

        if (currentView === "viewer" && activeContents.length) {
          const safeIndex = Math.min(currentIndex, activeContents.length - 1);

          renderContent(safeIndex);
        }

        if (currentView === "list") {
          renderSectionList();
        }
      }

      elements.startButton.disabled = false;

      console.info(`[EXHIBITIONS] 콘텐츠 ${contents.length}건 조회 완료`);
    } catch (error) {
      console.error("[EXHIBITIONS] 콘텐츠 조회 실패:", error);

      contents = [];
      activeContents = [];

      elements.startButton.disabled = true;

      elements.audioStatus.textContent =
        "전시 해설 정보를 불러오지 못했습니다.";
    }

    if (typeof updateClock === "function") {
      updateClock();
    }
  }

  /*
   * TTS 텍스트 구성
   */
  function buildNarrationText(content) {
    const title = getText(content, "title");
    const subtitle = getText(content, "subtitle");
    const keyMessage = getText(content, "keyMessage");

    const body = getLocalizedArray(content.body, currentLanguage);

    return [title, subtitle, keyMessage, ...body]
      .filter((value) => typeof value === "string" && value.trim())
      .join("\n\n");
  }

  /*
   * Typecast 음성 생성 및 재생
   */
  async function playAudio() {
    const content = activeContents[currentIndex];

    if (!content) return;

    if (isGeneratingAudio) return;

    const narrationText = buildNarrationText(content);

    if (!narrationText.trim()) {
      elements.audioStatus.textContent =
        "음성으로 변환할 해설 내용이 없습니다.";

      return;
    }

    stopAudio();

    const requestId = audioRequestId;

    isGeneratingAudio = true;

    elements.audioPlayButton.disabled = true;
    elements.audioPlayButton.textContent = "음성 생성 중...";

    elements.audioStatus.textContent =
      "음성 해설을 생성하고 있습니다. 잠시 기다려 주세요.";

    try {
      const response = await fetch(TTS_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "audio/mpeg, application/json",
        },
        body: JSON.stringify({
          text: narrationText,
          language: currentLanguage,
        }),
      });

      if (!response.ok) {
        let errorMessage = "음성 생성에 실패했습니다.";

        try {
          const errorData = await response.json();

          errorMessage = errorData.message || errorMessage;
        } catch (_) {
          // JSON이 아닌 오류 응답
        }

        throw new Error(errorMessage);
      }

      const audioBlob = await response.blob();

      if (requestId !== audioRequestId) return;

      if (!audioBlob.size) {
        throw new Error("생성된 음성 데이터가 없습니다.");
      }

      audioObjectUrl = URL.createObjectURL(audioBlob);

      elements.audio.src = audioObjectUrl;
      elements.audio.load();

      await elements.audio.play();

      if (requestId !== audioRequestId) return;

      elements.audioStatus.textContent = "음성 해설을 재생하고 있습니다.";

      elements.audioPlayButton.textContent = "Ⅱ 재생 중";
    } catch (error) {
      console.error("[TTS] 음성 재생 오류:", error);

      elements.audioStatus.textContent =
        error.message || "음성 재생 중 오류가 발생했습니다.";

      elements.audioPlayButton.textContent = "▶ 다시 듣기";

      if (audioObjectUrl) {
        URL.revokeObjectURL(audioObjectUrl);
        audioObjectUrl = null;
      }
    } finally {
      if (requestId === audioRequestId) {
        isGeneratingAudio = false;
        elements.audioPlayButton.disabled = false;
      }
    }
  }

  /*
   * 시작 버튼
   */
  function startExhibition() {
    if (!contents.length) return;

    openZoneSelect();
  }

  /*
   * 다음 콘텐츠
   */
  function moveNext() {
    if (currentIndex < activeContents.length - 1) {
      renderContent(currentIndex + 1);
      return;
    }

    stopAudio();
    openZoneSelect();
  }

  /*
   * 이전 콘텐츠
   */
  function movePrevious() {
    if (currentIndex > 0) {
      renderContent(currentIndex - 1);
    }
  }

  /*
   * 현재 구역 목차
   */
  function openSectionList() {
    if (!activeContents.length) return;

    stopAudio();

    renderSectionList();

    setView("list");
  }

  /*
   * 언어 변경
   */
  async function changeLanguage(language) {
    const nextLanguage = SUPPORTED_LANGUAGES.includes(language)
      ? language
      : "ko";

    if (nextLanguage === currentLanguage) return;

    stopAudio();

    await loadContents(nextLanguage);
  }

  /*
   * 이벤트 연결
   */
  function bindEvents() {
    elements.startButton.addEventListener("click", startExhibition);

    elements.zoneButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const zoneNo = Number(button.dataset.zone);

        selectZone(zoneNo);
      });
    });

    elements.previousButton.addEventListener("click", movePrevious);

    elements.nextButton.addEventListener("click", moveNext);

    elements.listButton.addEventListener("click", openSectionList);

    elements.backToViewerButton.addEventListener("click", () =>
      renderContent(currentIndex),
    );

    elements.backToZoneButton.addEventListener("click", openZoneSelect);

    elements.audioPlayButton.addEventListener("click", playAudio);

    elements.audioStopButton.addEventListener("click", stopAudio);

    elements.audio.addEventListener("ended", () => {
      elements.audioStatus.textContent = "음성 해설이 끝났습니다.";

      elements.audioPlayButton.textContent = "▶ 다시 듣기";

      if (audioObjectUrl) {
        URL.revokeObjectURL(audioObjectUrl);
        audioObjectUrl = null;
      }
    });

    elements.audio.addEventListener("error", () => {
      elements.audioStatus.textContent = "음성 파일을 재생할 수 없습니다.";

      elements.audioPlayButton.textContent = "▶ 다시 듣기";
    });

    elements.languageSelect.addEventListener("change", (event) => {
      changeLanguage(event.target.value);
    });
  }

  /*
   * 초기화
   */
  async function initialize() {
    bindEvents();

    if (elements.languageSelect) {
      currentLanguage = elements.languageSelect.value || "ko";
    }

    setView("start");

    await loadContents(currentLanguage);

    if (typeof updateClock === "function") {
      updateClock();
      setInterval(updateClock, 1000);
    }
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();
