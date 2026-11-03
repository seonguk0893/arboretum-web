(() => {
  const STORAGE_KEY = "arboretum-language";
  const supported = ["ko", "en", "ja", "zh"];

  const translations = {
    ko: {
      greenhouseMode: "온실 주행 모드",
      kioskMode: "키오스크 모드",
      driveMode: "주행 모드",
      docentTour: "전시 관람 해설",
      photoZone: "포토존 사진촬영",
      facilityCategory: "시설 안내",
      greenhouseLabel: "온실 안내 로봇",
      eventsCategory: "행사 안내",
      sejongArboretum: "시설 안내 로봇",
      adminSettingLabel: "관리자 설정",
      robotModeLabel: "로봇 운영 모드",
      photoExperienceLabel: "사진 촬영 체험",
      photoFrameLabel: "사진 프레임",
      greenhouseTitle: "온실을 더 편리하게 둘러보세요",
      exhibition: "전시 관람 해설",
      exhibitionDesc:
        "온실의 식물과 전시 이야기를<br>로봇과 함께 듣고 둘러보세요.",
      photo: "포토존 사진촬영",
      photoDesc: "수목원 전용 프레임으로<br>사진을 촬영해 보세요.",
      facility: "시설 안내",
      greenhouseFacilityDesc:
        "화장실, 휴게 공간, 출입구 등<br>필요한 위치를 안내해 드릴게요.",
      voiceAsk: "음성으로 물어보기",
      voiceAskDesc: "궁금한 것을 음성으로 물어보세요",
      photoExperience: "사계절온실 사진촬영",
      cameraPreparing: "카메라를 준비하고 있습니다.",
      photoCreating: "사진을 만들고 있습니다.",
      photoCreateError: "사진을 만드는 중 문제가 발생했습니다.",
      retake: "다시 촬영",
      savePhoto: "사진 저장",
      frameTitle: "포토 프레임 선택",
      frameDesc:
        "원하는 프레임을 선택하고<br>수목원의 순간을 사진으로 남겨보세요.",
      frame: "프레임",
      cameraError: "카메라를 사용할 수 없습니다. 카메라 권한을 확인해 주세요.",
      cameraDenied:
        "카메라 접근이 거부되었습니다. 브라우저 권한을 확인해 주세요.",
      photoSaved: "사진이 저장되었습니다.",
      captureError: "사진을 촬영하지 못했습니다. 다시 시도해 주세요.",
      hello: "안녕하세요!",
      help: "무엇을 도와드릴까요?",
      lobbyFacility: "시설 안내",
      lobbyFacilityDesc:
        "화장실, 편의시설, 휴게시설 등<br>수목원 곳곳의 시설을 찾아드릴게요.",
      events: "행사 안내",
      eventsDesc:
        "지금 진행 중인 행사와 전시,<br>다양한 수목원 프로그램을 알려드릴게요.",
      adminSettings: "관리자 설정",
      enterPin: "관리자 PIN을 입력해주세요.",
      pinWrong: "관리자 PIN이 올바르지 않습니다.",
      clear: "지우기",
      confirm: "확인",
      robotModeSettings: "운영 모드 설정",
      chooseMode: "안내 로봇의 운영 방식을 선택해주세요.",
      currentSelection: "현재 선택",
      kioskModeDesc: "로봇이 정해진 위치에서<br>안내 화면을 제공합니다.",
      driveModeDesc:
        "선택한 목적지까지 로봇이 직접 이동하고<br>음성으로 안내합니다.",
      saveMode: "운영 모드 저장",
      facilityPageTitle: "시설 안내",
      facilityPageDesc: "안내받을 시설을 선택해 주세요.",

      // 💡 Supabase 데이터 기반 시설 명칭 다국어 매핑 (한글)
      toilet: "화장실",
      cafe: "아이에떼 커피",
      convenience: "이마트24 편의점",
      infirmary: "의무실",
      nursing: "수유실",
      education: "교육체험공간",
      entrance: "주출입구",
      sub_entrance: "부출입구",
      special_entrance: "특별전시실 출입구",
      mediterranean_top: "지중해온실 상단 출입구",
      mediterranean_bottom: "지중해온실 하단 출입구",
      tropical_top: "열대온실 상단 출입구",
      tropical_bottom: "열대온실 하단 출입구",

      // 💡 시설별 위치 설명 다국어 매핑 (한글)
      desc_toilet: "로비 중앙 상단",
      desc_cafe: "중앙 원형 내부 좌측",
      desc_convenience: "중앙 원형 내부 우측",
      desc_infirmary: "본관 1층 안내데스크 옆",
      desc_nursing: "본관 1층 화장실 옆",
      desc_entrance: "야외 연결 (좌측 하단)",

      mapTitle: "시설 위치 안내",
      mapHelp: "안내도에서 선택한 시설의 위치를 확인해 주세요.",
      cancel: "취소",
      guide: "안내 시작",
      guideRequestReady: "시설 안내 요청이 준비되었습니다.",
      robotNotConnected: "현재 로봇 제어 시스템과 연결되어 있지 않습니다.",
      backHome: "메인 화면으로",
      selectedFacility: "선택한 시설",
      mapSchematic: "시설 배치는 예시 안내도이며 실제 위치와 다를 수 있습니다.",
      exhibitionsTitle: "전시 안내",
      exhibitionsIntro:
        "국립세종수목원에서 만나볼 수 있는 다양한 전시를 소개합니다.",
      nowOn: "현재 전시",
      currentExhibitions: "현재 진행 중인 전시",
      exhibitionCountLabel: "개의 전시",
      ongoing: "진행 중",
      special: "특별",
      period: "기간",
      location: "장소",
      posterPreparing: "포스터 이미지 준비 중",
      loadingExhibitions: "전시 정보를 불러오는 중입니다.",
      waitMoment: "잠시만 기다려주세요.",
      noExhibitions: "현재 진행 중인 전시가 없습니다.",
      prepareNewExhibitions: "새로운 전시를 준비하고 있습니다.",
      loadError: "전시 정보를 불러오지 못했습니다.",
      tryAgain: "잠시 후 다시 시도해주세요.",
      retry: "다시 불러오기",
      exhibitionIntroduction: "전시 소개",
      exhibitionListen: "🔊 전시 소개 듣기",
      preparingVoice: "⏳ 음성 준비 중...",
      stopReading: "⏹ 읽기 중지",
      closeExhibition: "전시 상세 닫기",
      exhibitionPoster: "전시 포스터",
      noDescription: "전시 소개 정보가 없습니다.",
      voicePlayError: "음성을 재생하지 못했습니다. 잠시 후 다시 시도해주세요.",
      voiceCreateError:
        "음성을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.",
      greenhouseHome: "온실 메인으로 이동",
      appTitle: "세종국립수목원 안내 로봇",
      logoAlt: "국립세종수목원",
      characterAlt: "수목원 캐릭터",
      mainMenuAria: "주요 안내 메뉴",
      lobbyGuideAria: "시설 및 길 안내",
      lobbyGuideTitle: "시설 안내 및 길 안내",
      lobbyGuideDesc:
        "화장실 · 카페 · 수유실 · 출입구 등 목적지까지 편리하게 안내해요",
      luggageTitle: "짐 운반 도움",
      luggageDesc: "교통약자 물품, 적재 · 운반",
      surveyTitle: "만족도 조사",
      surveyDesc: "관람 경험과 의견을 들려주세요",
      voiceBarTitle: '"로봇아, 화장실 어디야?"',
      voiceBarDesc: "말로 물어보세요 · 음성 · 번역 지원",
      voiceModalTitle: "무엇을 도와드릴까요?",
      voicePrompt: "아래 버튼을 누르고 말씀해 주세요.",
      voiceStart: "음성인식 시작",
      voiceListening: "듣고 있습니다. 말씀해 주세요.",
      voiceProcessing: "음성을 인식하고 있습니다...",
      voiceRecognized: "음성이 인식되었습니다.",
      voiceNoSpeech: "음성이 감지되지 않았습니다. 다시 말씀해 주세요.",
      voiceRecognitionError:
        "음성인식 중 문제가 발생했습니다. 다시 시도해 주세요.",
      voiceUnsupported: "이 브라우저에서는 음성인식을 지원하지 않습니다.",
      voiceResultLabel: "인식된 음성",
      voiceResultPlaceholder: "여기에 인식된 문장이 표시됩니다.",
      voiceModalClose: "음성 모달 닫기",
      exhibitionsPageTitle: "전시 안내 - 국립세종수목원",
      languageSelectLabel: "언어 선택",
      greenhouseHome: "온실 메인으로 이동",
      exhibitionsTitle: "식물 전시해설",
      exhibitionsSubtitle: "식물의 이야기를 만나보세요",
      plantGuideLabel: "해설 지점",
      plantImageLabel: "식물 전시 이미지",
      plantImageAlt: "식물 전시 대표 이미지",
      plantDescriptionLabel: "식물 해설 내용",
      plantLoading: "식물 정보를 불러오는 중입니다.",
      pleaseWait: "잠시만 기다려주세요.",
      audioGuideLabel: "음성 해설 재생",
      audioGuide: "음성 해설",
      audioGuidePrompt: "해설을 들으며 식물을 알아보세요.",
      playAudioGuide: "음성 해설 재생",
      listenToGuide: "해설 듣기",
      pauseAudioGuide: "일시정지",
      previousGuide: "← 이전 해설",
      replayGuide: "다시 듣기",
      nextGuide: "다음 해설 →",
      audioLoading: "음성 해설을 준비하고 있습니다.",
      audioPlaying: "음성 해설 재생 중",
      audioPaused: "음성 해설 일시정지",
      audioEnded: "음성 해설이 끝났습니다.",
      audioError: "음성 해설을 재생할 수 없습니다.",
      noPreviousGuide: "이전 해설이 없습니다.",
      noNextGuide: "다음 해설이 없습니다.",
      plantLoadError: "식물 정보를 불러오지 못했습니다.",
    },
    en: {
      greenhouseMode: "Greenhouse Drive Mode",
      kioskMode: "Kiosk Mode",
      driveMode: "Drive Mode",
      docentTour: "Docent Tour",
      photoZone: "Photo Zone",
      facilityCategory: "Facility Guide",
      greenhouseLabel: "Greenhouse Docent Robot",
      eventsCategory: "Events & Exhibitions",
      sejongArboretum: "Sejong National Arboretum",
      adminSettingLabel: "Admin Settings",
      robotModeLabel: "Robot Mode",
      photoExperienceLabel: "Photo Experience",
      photoFrameLabel: "Photo Frame",
      greenhouseTitle: "Explore the greenhouse with ease",
      exhibition: "Exhibition Tour",
      exhibitionDesc:
        "Discover greenhouse plants and exhibitions<br>with your docent robot.",
      photo: "Photo Zone",
      photoDesc:
        "Capture beautiful moments in the greenhouse<br>and keep them as photos.",
      facility: "Facility Guide",
      greenhouseFacilityDesc:
        "Find restrooms, resting areas,<br>entrances, and other facilities.",
      voiceAsk: "Voice Search",
      voiceAskDesc: "Ask a question using your voice",
      photoExperience: "Four Seasons Greenhouse Photo",
      cameraPreparing: "Preparing the camera...",
      photoCreating: "Creating your photo...",
      photoCreateError: "There was a problem creating the photo.",
      retake: "Retake",
      savePhoto: "Save Photo",
      frameTitle: "Select Photo Frame",
      frameDesc: "Choose a frame and<br>keep a memory of the arboretum.",
      frame: "Frame",
      cameraError:
        "The camera is unavailable. Please check camera permissions.",
      cameraDenied:
        "Camera access was denied. Please check your browser permissions.",
      photoSaved: "Your photo has been saved.",
      captureError: "Could not take the photo. Please try again.",
      hello: "Hello!",
      help: "How can I help you?",
      lobbyFacility: "Facility Guide",
      lobbyFacilityDesc:
        "Find restrooms, amenities, and resting areas<br>throughout the arboretum.",
      events: "Events & Exhibitions",
      eventsDesc:
        "Explore current events, exhibitions,<br>and arboretum programs.",
      adminSettings: "Administrator Settings",
      enterPin: "Enter the administrator PIN.",
      pinWrong: "The administrator PIN is incorrect.",
      clear: "Clear",
      confirm: "Confirm",
      robotModeSettings: "Robot Operating Mode",
      chooseMode: "Choose how the guide robot should operate.",
      currentSelection: "Current Selection",
      kioskModeDesc: "The robot provides information<br>from a fixed location.",
      driveModeDesc:
        "The robot moves to your destination<br>and provides voice guidance.",
      saveMode: "Save Mode",
      facilityPageTitle: "Facility Guide",
      facilityPageDesc: "Select the facility you need.",

      // 💡 영어 번역 매핑
      toilet: "Restroom",
      cafe: "Aiette Coffee",
      convenience: "Emart24 Convenience Store",
      infirmary: "Infirmary",
      nursing: "Nursing Room",
      education: "Education & Experience Center",
      entrance: "Main Entrance",
      sub_entrance: "Sub Entrance",
      special_entrance: "Special Exhibition Entrance",
      mediterranean_top: "Mediterranean Greenhouse Top Entrance",
      mediterranean_bottom: "Mediterranean Greenhouse Bottom Entrance",
      tropical_top: "Tropical Greenhouse Top Entrance",
      tropical_bottom: "Tropical Greenhouse Bottom Entrance",

      desc_toilet: "Upper Center of Lobby",
      desc_cafe: "Left Side of Central Circle",
      desc_convenience: "Right Side of Central Circle",
      desc_infirmary: "Next to 1F Main Desk",
      desc_nursing: "Next to 1F Restroom",
      desc_entrance: "Outdoor Connection (Lower Left)",

      mapTitle: "Facility Location",
      mapHelp: "Check the selected facility on the map.",
      cancel: "Cancel",
      guide: "Start Guidance",
      guideRequestReady: "Your facility guidance request is ready.",
      robotNotConnected: "The robot control system is not connected yet.",
      backHome: "Back to Home",
      selectedFacility: "Selected Facility",
      mapSchematic:
        "This map is for illustrative purposes; actual locations may differ.",
      exhibitionsTitle: "Exhibitions",
      exhibitionsIntro:
        "Discover the exhibitions available at Sejong National Arboretum.",
      nowOn: "NOW ON",
      currentExhibitions: "Current Exhibitions",
      exhibitionCountLabel: " exhibitions",
      ongoing: "Ongoing",
      special: "Special",
      period: "Period",
      location: "Location",
      posterPreparing: "Poster image coming soon",
      loadingExhibitions: "Loading exhibition information...",
      waitMoment: "Please wait a moment.",
      noExhibitions: "There are no current exhibitions.",
      prepareNewExhibitions: "New exhibitions are being prepared.",
      loadError: "Unable to load exhibition information.",
      tryAgain: "Please try again shortly.",
      retry: "Reload",
      exhibitionIntroduction: "About the Exhibition",
      exhibitionListen: "🔊 Listen to Introduction",
      preparingVoice: "⏳ Preparing audio...",
      stopReading: "⏹ Stop reading",
      closeExhibition: "Close Details",
      exhibitionPoster: "Exhibition Poster",
      noDescription: "No exhibition description is available.",
      voicePlayError: "Could not play audio. Please try again shortly.",
      voiceCreateError: "Could not generate audio. Please try again shortly.",
      greenhouseHome: "Greenhouse Home",
      appTitle: "Sejong National Arboretum Guide Robot",
      logoAlt: "Sejong National Arboretum",
      characterAlt: "Arboretum mascot",
      mainMenuAria: "Main guide menu",
      lobbyGuideAria: "Facility and wayfinding guide",
      lobbyGuideTitle: "Facility & Route Guide",
      lobbyGuideDesc:
        "Restrooms, café, nursing room, entrances and more, with easy guidance to your destination",
      luggageTitle: "Luggage Assistance",
      luggageDesc:
        "Loading and carrying help for visitors with limited mobility",
      surveyTitle: "Satisfaction Survey",
      surveyDesc: "Tell us about your visit",
      voiceBarTitle: '"Robot, where is the restroom?"',
      voiceBarDesc: "Just ask aloud · Voice · Translation supported",
      voiceModalTitle: "How can I help you?",
      voicePrompt: "Press the button below and speak.",
      voiceStart: "Start Voice Recognition",
      voiceListening: "Listening. Please speak.",
      voiceProcessing: "Recognizing your speech...",
      voiceRecognized: "Your speech has been recognized.",
      voiceNoSpeech: "No speech detected. Please try again.",
      voiceRecognitionError: "Voice recognition failed. Please try again.",
      voiceUnsupported: "Voice recognition is not supported in this browser.",
      voiceResultLabel: "Recognized Speech",
      voiceResultPlaceholder: "Your recognized speech will appear here.",
      voiceModalClose: "Close voice dialog",
      exhibitionsPageTitle: "Exhibitions - Sejong National Arboretum",
      languageSelectLabel: "Select language",
      greenhouseHome: "Go to greenhouse home",
      exhibitionsTitle: "Plant Exhibition Guide",
      exhibitionsSubtitle: "Discover the stories of plants",
      plantGuideLabel: "Guide Point",
      plantImageLabel: "Plant exhibition image",
      plantImageAlt: "Main image of the plant exhibition",
      plantDescriptionLabel: "Plant description",
      plantLoading: "Loading plant information...",
      pleaseWait: "Please wait.",
      audioGuideLabel: "Audio guide playback",
      audioGuide: "Audio Guide",
      audioGuidePrompt: "Learn about plants while listening to the guide.",
      playAudioGuide: "Play audio guide",
      listenToGuide: "Listen to Guide",
      pauseAudioGuide: "Pause",
      previousGuide: "← Previous",
      replayGuide: "Replay",
      nextGuide: "Next →",
      audioLoading: "Preparing the audio guide.",
      audioPlaying: "Audio guide playing",
      audioPaused: "Audio guide paused",
      audioEnded: "The audio guide has ended.",
      audioError: "Unable to play the audio guide.",
      noPreviousGuide: "There is no previous guide.",
      noNextGuide: "There is no next guide.",
      plantLoadError: "Failed to load plant information.",
    },
    ja: {
      greenhouseMode: "温室走行モード",
      kioskMode: "キオスクモード",
      driveMode: "走行モード",
      docentTour: "展示ガイド",
      photoZone: "フォトスポット",
      facilityCategory: "施設案内",
      greenhouseLabel: "温室案内ロボット",
      eventsCategory: "イベント",
      sejongArboretum: "国立世宗樹木園",
      adminSettingLabel: "管理者設定",
      robotModeLabel: "ロボット運用モード",
      photoExperienceLabel: "写真撮影体験",
      photoFrameLabel: "フォトフレーム",
      greenhouseTitle: "温室をもっと快適に巡りましょう",
      exhibition: "展示ガイド",
      exhibitionDesc:
        "温室の植物や展示について<br>ロボットと一緒に楽しみましょう。",
      photo: "フォトスポット撮影",
      photoDesc: "温室の美しい瞬間を写真に<br>残しましょう。",
      facility: "施設案内",
      greenhouseFacilityDesc:
        "トイレ、休憩スペース、入口など<br>必要な場所をご案内します。",
      voiceAsk: "音声で尋ねる",
      voiceAskDesc: "音声で気軽に質問してください",
      photoExperience: "四季温室フォト撮影",
      cameraPreparing: "カメラを準備しています…",
      photoCreating: "写真を作成しています…",
      photoCreateError: "写真の作成中に問題が発生しました。",
      retake: "撮り直す",
      savePhoto: "写真を保存",
      frameTitle: "フォトフレーム選択",
      frameDesc: "フレームを選んで<br>植物園の思い出を写真に残しましょう。",
      frame: "フレーム",
      cameraError: "カメラを使用できません。カメラの権限を確認してください。",
      cameraDenied:
        "カメラへのアクセスが拒否されました。ブラウザの権限を確認してください。",
      photoSaved: "写真を保存しました。",
      captureError: "撮影できませんでした。もう一度お試しください。",
      hello: "こんにちは！",
      help: "どのようなお手伝いが必要ですか？",
      lobbyFacility: "施設案内",
      lobbyFacilityDesc:
        "トイレ、各種施設、休憩スペースなど<br>園内の施設をご案内します。",
      events: "イベント案内",
      eventsDesc:
        "開催中のイベントや展示、<br>植物園のプログラムをご案内します。",
      adminSettings: "管理者設定",
      enterPin: "管理者PINを入力してください。",
      pinWrong: "管理者PINが正しくありません。",
      clear: "クリア",
      confirm: "確認",
      robotModeSettings: "運用モード設定",
      chooseMode: "案内ロボットの運用方法を選択してください。",
      currentSelection: "現在の選択",
      kioskModeDesc: "ロボットは固定位置で<br>案内画面を表示します。",
      driveModeDesc: "目的地まで移動し<br>音声でご案内します。",
      saveMode: "モードを保存",
      facilityPageTitle: "施設案内",
      facilityPageDesc: "案内が必要な施設を選択してください。",

      // 💡 일본어 번역 매핑
      toilet: "トイレ",
      cafe: "アイエットコーヒー",
      convenience: "Eマート24 コンビニ",
      infirmary: "救護室",
      nursing: "授乳室",
      education: "教育体験スペース",
      entrance: "正門",
      sub_entrance: "副出入り口",
      special_entrance: "特別展示室出入り口",
      mediterranean_top: "地中海温室 上部出入り口",
      mediterranean_bottom: "地中海温室 下部出入り口",
      tropical_top: "熱帯温室 上部出入り口",
      tropical_bottom: "熱帯温室 下部出入り口",

      desc_toilet: "ロビー中央上部",
      desc_cafe: "中央円形内部左側",
      desc_convenience: "中央円形内部右側",
      desc_infirmary: "本館1階案内デスク横",
      desc_nursing: "本館1階トイレ横",
      desc_entrance: "屋外連絡（左下）",

      mapTitle: "施設の位置案内",
      mapHelp: "地図で選択した施設の位置を確認してください。",
      cancel: "キャンセル",
      guide: "案内を開始",
      guideRequestReady: "施設案内のリクエストを準備しました。",
      robotNotConnected: "ロボット制御システムに接続されていません。",
      backHome: "メイン画面へ",
      selectedFacility: "選択した施設",
      mapSchematic: "施設配置は参考図です。実際の位置と異なる場合があります。",
      exhibitionsTitle: "展示案内",
      exhibitionsIntro:
        "国立世宗樹木園でご覧いただけるさまざまな展示をご紹介します。",
      nowOn: "開催中",
      currentExhibitions: "開催中の展示",
      exhibitionCountLabel: "件の展示",
      ongoing: "開催中",
      special: "特別",
      period: "期間",
      location: "場所",
      posterPreparing: "ポスター画像を準備中です",
      loadingExhibitions: "展示情報を読み込んでいます…",
      waitMoment: "しばらくお待ちください。",
      noExhibitions: "現在開催中の展示はありません。",
      prepareNewExhibitions: "新しい展示を準備しています。",
      loadError: "展示情報を読み込めませんでした。",
      tryAgain: "しばらくしてからもう一度お試しください。",
      retry: "再読み込み",
      exhibitionIntroduction: "展示紹介",
      exhibitionListen: "🔊 展示紹介を聞く",
      preparingVoice: "⏳ 音声を準備しています…",
      stopReading: "⏹ 読み上げを停止",
      closeExhibition: "展示詳細を閉じる",
      exhibitionPoster: "展示ポスター",
      noDescription: "展示紹介情報はありません。",
      voicePlayError:
        "音声を再生できませんでした。しばらくしてから再試行してください。",
      voiceCreateError:
        "音声を生成できませんでした。しばらくしてから再試行してください。",
      greenhouseHome: "温室のトップへ",
      appTitle: "国立世宗樹木園 案内ロボット",
      logoAlt: "国立世宗樹木園",
      characterAlt: "樹木園キャラクター",
      mainMenuAria: "主な案内メニュー",
      lobbyGuideAria: "施設・道案内",
      lobbyGuideTitle: "施設案内・道案内",
      lobbyGuideDesc:
        "トイレ・カフェ・授乳室・出入口など、目的地まで分かりやすくご案内します",
      luggageTitle: "荷物運搬サポート",
      luggageDesc: "交通弱者のお荷物の積載・運搬",
      surveyTitle: "満足度調査",
      surveyDesc: "ご観覧の感想をお聞かせください",
      voiceBarTitle: "「ロボット、トイレはどこ？」",
      voiceBarDesc: "声で質問してください · 音声 · 翻訳対応",
      voiceModalTitle: "どのようなお手伝いが必要ですか？",
      voicePrompt: "下のボタンを押して話してください。",
      voiceStart: "音声認識を開始",
      voiceListening: "聞き取っています。話してください。",
      voiceProcessing: "音声を認識しています...",
      voiceRecognized: "音声を認識しました。",
      voiceNoSpeech: "音声が検出されませんでした。もう一度話してください。",
      voiceRecognitionError:
        "音声認識中に問題が発生しました。もう一度お試しください。",
      voiceUnsupported: "このブラウザは音声認識に対応していません。",
      voiceResultLabel: "認識された音声",
      voiceResultPlaceholder: "認識された文章がここに表示されます。",
      voiceModalClose: "音声ダイアログを閉じる",
      exhibitionsPageTitle: "展示案内 - 国立世宗樹木園",
      languageSelectLabel: "言語を選択",
      greenhouseHome: "温室のメイン画面へ移動",
      exhibitionsTitle: "植物展示ガイド",
      exhibitionsSubtitle: "植物の物語に出会いましょう",
      plantGuideLabel: "解説地点",
      plantImageLabel: "植物展示画像",
      plantImageAlt: "植物展示のメイン画像",
      plantDescriptionLabel: "植物の解説",
      plantLoading: "植物情報を読み込んでいます...",
      pleaseWait: "しばらくお待ちください。",
      audioGuideLabel: "音声ガイドの再生",
      audioGuide: "音声ガイド",
      audioGuidePrompt: "音声ガイドを聞きながら植物について学びましょう。",
      playAudioGuide: "音声ガイドを再生",
      listenToGuide: "解説を聞く",
      pauseAudioGuide: "一時停止",
      previousGuide: "← 前の解説",
      replayGuide: "もう一度聞く",
      nextGuide: "次の解説 →",
      audioLoading: "音声ガイドを準備しています。",
      audioPlaying: "音声ガイドを再生中",
      audioPaused: "音声ガイドを一時停止中",
      audioEnded: "音声ガイドが終了しました。",
      audioError: "音声ガイドを再生できません。",
      noPreviousGuide: "前の解説はありません。",
      noNextGuide: "次の解説はありません。",
      plantLoadError: "植物情報を読み込めませんでした。",
    },
    zh: {
      greenhouseMode: "温室行驶模式",
      kioskMode: "固定导览模式",
      driveMode: "行驶模式",
      docentTour: "展览讲解",
      photoZone: "拍照区",
      facilityCategory: "设施指南",
      greenhouseLabel: "温室导览机器人",
      eventsCategory: "活动指南",
      sejongArboretum: "世宗国家植物园",
      adminSettingLabel: "管理员设置",
      robotModeLabel: "机器人运行模式",
      photoExperienceLabel: "拍照体验",
      photoFrameLabel: "照片相框",
      greenhouseTitle: "轻松畅游温室",
      exhibition: "展览讲解",
      exhibitionDesc: "与导览机器人一起了解<br>温室植物和展览故事。",
      photo: "拍照区",
      photoDesc: "记录温室里的美好瞬间<br>并保存为照片。",
      facility: "设施指南",
      greenhouseFacilityDesc:
        "为您查找洗手间、休息区、入口等<br>所需设施的位置。",
      voiceAsk: "语音提问",
      voiceAskDesc: "用语音提出您想了解的问题",
      photoExperience: "四季温室拍照",
      cameraPreparing: "正在准备相机…",
      photoCreating: "正在生成照片…",
      photoCreateError: "生成照片时出现问题。",
      retake: "重新拍摄",
      savePhoto: "保存照片",
      frameTitle: "选择照片相框",
      frameDesc: "选择喜欢的相框<br>留下植物园的美好回忆。",
      frame: "相框",
      cameraError: "无法使用相机，请检查相机权限。",
      cameraDenied: "相机访问被拒绝，请检查浏览器权限。",
      photoSaved: "照片已保存。",
      captureError: "拍摄失败，请重试。",
      hello: "您好！",
      help: "有什么可以帮您？",
      lobbyFacility: "设施指南",
      lobbyFacilityDesc: "为您查找园区内的洗手间、便利设施<br>和休息区域。",
      events: "活动指南",
      eventsDesc: "了解正在举办的活动、展览<br>以及植物园各类项目。",
      adminSettings: "管理员设置",
      enterPin: "请输入管理员 PIN。",
      pinWrong: "管理员 PIN 不正确。",
      clear: "清除",
      confirm: "确认",
      robotModeSettings: "运行模式设置",
      chooseMode: "请选择导览机器人的运行方式。",
      currentSelection: "当前选择",
      kioskModeDesc: "机器人将在固定位置<br>显示导览信息。",
      driveModeDesc: "机器人将前往指定地点<br>并提供语音导览。",
      saveMode: "保存模式",
      facilityPageTitle: "设施指南",
      facilityPageDesc: "请选择您需要的设施。",

      // 💡 중국어 번역 매핑
      toilet: "洗手间",
      cafe: "Aiette 咖啡厅",
      convenience: "Emart24 便利店",
      infirmary: "医务室",
      nursing: "母婴室",
      education: "教育体验空间",
      entrance: "正门",
      sub_entrance: "副出入口",
      special_entrance: "特别展览室出入口",
      mediterranean_top: "地中海温室顶部出入口",
      mediterranean_bottom: "地中海温室底部出入口",
      tropical_top: "热带温室顶部出入口",
      tropical_bottom: "热带温室底部出入口",

      desc_toilet: "大厅中央上方",
      desc_cafe: "中央圆形内部左侧",
      desc_convenience: "中央圆形内部右侧",
      desc_infirmary: "本馆1楼问询台旁",
      desc_nursing: "本馆1楼洗手间旁",
      desc_entrance: "户外连接（左下）",

      mapTitle: "设施位置指南",
      mapHelp: "请在地图上查看所选设施的位置。",
      cancel: "取消",
      guide: "开始导航",
      guideRequestReady: "设施引导请求已准备就绪。",
      robotNotConnected: "尚未连接机器人控制系统。",
      backHome: "返回主页",
      selectedFacility: "所选设施",
      mapSchematic: "此图为示意图，设施实际位置可能有所不同。",
      exhibitionsTitle: "展览介绍",
      exhibitionsIntro: "为您介绍世宗国家植物园正在展出的各类展览。",
      nowOn: "正在展出",
      currentExhibitions: "当前展览",
      exhibitionCountLabel: "个展览",
      ongoing: "进行中",
      special: "特别展览",
      period: "期间",
      location: "地点",
      posterPreparing: "展览海报准备中",
      loadingExhibitions: "正在加载展览信息…",
      waitMoment: "请稍候。",
      noExhibitions: "目前没有正在进行的展览。",
      prepareNewExhibitions: "正在筹备新的展览。",
      loadError: "无法加载展览信息。",
      tryAgain: "请稍后重试。",
      retry: "重新加载",
      exhibitionIntroduction: "展览介绍",
      exhibitionListen: "🔊 收听展览介绍",
      preparingVoice: "⏳ 正在准备语音…",
      stopReading: "⏹ 停止朗读",
      closeExhibition: "关闭展览详情",
      exhibitionPoster: "展览海报",
      noDescription: "暂无展览介绍信息。",
      voicePlayError: "无法播放语音，请稍后重试。",
      voiceCreateError: "无法生成语音，请稍后重试。",
      greenhouseHome: "返回温室首页",
      appTitle: "世宗国家植物园导览机器人",
      logoAlt: "世宗国家植物园",
      characterAlt: "植物园吉祥物",
      mainMenuAria: "主要导览菜单",
      lobbyGuideAria: "设施与路线指引",
      lobbyGuideTitle: "设施与路线指引",
      lobbyGuideDesc: "洗手间、咖啡厅、母婴室、出入口等，轻松带您前往目的地",
      luggageTitle: "行李搬运协助",
      luggageDesc: "为行动不便人士提供物品装载与搬运",
      surveyTitle: "满意度调查",
      surveyDesc: "请分享您的参观体验",
      voiceBarTitle: "“机器人，洗手间在哪里？”",
      voiceBarDesc: "直接用语音提问 · 语音 · 支持翻译",
      voiceModalTitle: "有什么可以帮您？",
      voicePrompt: "请按下方按钮并开始说话。",
      voiceStart: "开始语音识别",
      voiceListening: "正在聆听，请开始说话。",
      voiceProcessing: "正在识别语音...",
      voiceRecognized: "语音识别成功。",
      voiceNoSpeech: "未检测到语音，请重试。",
      voiceRecognitionError: "语音识别过程中出现问题，请重试。",
      voiceUnsupported: "此浏览器不支持语音识别。",
      voiceResultLabel: "识别结果",
      voiceResultPlaceholder: "识别出的文字将显示在这里。",
      voiceModalClose: "关闭语音窗口",
      exhibitionsPageTitle: "展览介绍 - 国立世宗树木园",
      languageSelectLabel: "选择语言",
      greenhouseHome: "返回温室主页",
      exhibitionsTitle: "植物展览讲解",
      exhibitionsSubtitle: "探索植物的故事",
      plantGuideLabel: "讲解点",
      plantImageLabel: "植物展览图片",
      plantImageAlt: "植物展览主图",
      plantDescriptionLabel: "植物介绍",
      plantLoading: "正在加载植物信息...",
      pleaseWait: "请稍候。",
      audioGuideLabel: "播放语音讲解",
      audioGuide: "语音讲解",
      audioGuidePrompt: "聆听讲解，了解植物知识。",
      playAudioGuide: "播放语音讲解",
      listenToGuide: "收听讲解",
      pauseAudioGuide: "暂停",
      previousGuide: "← 上一个讲解",
      replayGuide: "重新播放",
      nextGuide: "下一个讲解 →",
      audioLoading: "正在准备语音讲解。",
      audioPlaying: "正在播放语音讲解",
      audioPaused: "语音讲解已暂停",
      audioEnded: "语音讲解已结束。",
      audioError: "无法播放语音讲解。",
      noPreviousGuide: "没有上一个讲解。",
      noNextGuide: "没有下一个讲解。",
      plantLoadError: "无法加载植物信息。",
    },
  };

  const pageTranslations = {
    greenhouse: {
      "#modeStatus": "greenhouseMode",
      ".welcome h1": "greenhouseTitle",
      ".welcome-label": "greenhouseLabel",
      ".exhibition-card .menu-text strong": "exhibition",
      ".exhibition-card .menu-text p": "exhibitionDesc",
      ".photo-card .menu-text strong": "photo",
      ".photo-card .menu-text p": "photoDesc",
      ".facility-guide-card .menu-text strong": "facility",
      ".facility-guide-card .menu-text p": "greenhouseFacilityDesc",
      ".voice-text strong": "voiceAsk",
      ".voice-text small": "voiceAskDesc",
      ".exhibition-card .menu-category": "docentTour",
      ".photo-card .menu-category": "photoZone",
      ".facility-guide-card .menu-category": "facilityCategory",
      ".camera-modal-header h2": "photoExperience",
      "#cameraMessage": "cameraPreparing",
      "#cameraRetake": "retake",
      "#cameraSave": "savePhoto",
      ".frame-panel-title strong": "frameTitle",
      ".frame-panel-title p": "frameDesc",
    },
    lobby: {
      "#modeStatus": "kioskMode",
      ".welcome h1": "hello",
      ".welcome h2": "help",
      ".welcome-label": "sejongArboretum",
      ".facility-card .menu-text strong": "lobbyFacility",
      ".facility-card .menu-text p": "lobbyFacilityDesc",
      ".event-card .menu-text strong": "events",
      ".event-card .menu-text p": "eventsDesc",
      ".voice-text strong": "voiceAsk",
      ".voice-text small": "voiceAskDesc",
      ".facility-card .menu-category": "facilityCategory",
      ".event-card .menu-category": "eventsCategory",
      "#pinStep .admin-modal-header h2": "adminSettings",
      "#pinStep .admin-modal-header p": "enterPin",
      ".mode-save-button": "saveMode",
    },
    facilities: {
      "#modeStatus": "facilityPageTitle",
      "#facilityPageTitle": "facilityPageTitle",
      "#facilityPageDesc": "facilityPageDesc",
      "#facilityModalTitle": "mapTitle",
      "#facilityMapHelp": "mapHelp",
      "#cancelFacility": "cancel",
      "#guideFacility": "guide",
      "#backHome": "backHome",
      "#mapSchematicNote": "mapSchematic",
    },
    exhibitions: {
      ".exhibitions-intro h1": "exhibitionsTitle",
      ".exhibitions-intro p": "exhibitionsIntro",
      ".exhibitions-heading > div:first-child span": "nowOn",
      ".exhibitions-heading h2": "currentExhibitions",
      ".exhibition-count > span": "exhibitionCountLabel",
      ".exhibition-status": "ongoing",
      ".meta-row:first-child .meta-label": "period",
      ".meta-row:last-child .meta-label": "location",
      ".poster-empty p": "posterPreparing",
      ".modal-status span": "ongoing",
      ".modal-meta-row:first-child span": "period",
      ".modal-meta-row:last-child span": "location",
      ".modal-description h3": "exhibitionIntroduction",
      "#readDescriptionBtn": "exhibitionListen",
    },
  };

  function language() {
    try {
      const value = localStorage.getItem(STORAGE_KEY) || "ko";
      return supported.includes(value) ? value : "ko";
    } catch (_) {
      return "ko";
    }
  }

  function t(key) {
    const lang = language();
    return (
      (translations[lang] && translations[lang][key]) ||
      translations.ko[key] ||
      key
    );
  }

  function setText(element, value) {
    if (!element) return;
    element.innerHTML = value;
  }

  function applyTranslations() {
    const lang = language();
    document.documentElement.lang = lang;
    const page = document.querySelector(".greenhouse-page")
      ? "greenhouse"
      : document.querySelector(".lobby-page")
        ? "lobby"
        : document.querySelector(".facilities-page")
          ? "facilities"
          : document.querySelector(".exhibitions-page")
            ? "exhibitions"
            : null;

    if (page && pageTranslations[page]) {
      Object.entries(pageTranslations[page]).forEach(([selector, key]) => {
        document.querySelectorAll(selector).forEach((element) => {
          if (selector === "#modeStatus" && page === "lobby") {
            setText(
              element,
              t(
                localStorage.getItem("robotMode") === "drive"
                  ? "driveMode"
                  : "kioskMode",
              ),
            );
          } else {
            setText(element, t(key));
          }
        });
      });
    }

    // 💡 1. 일반 data-i18n 속성 번역 처리
    document.querySelectorAll("[data-i18n]").forEach((element) => {
      setText(element, t(element.dataset.i18n));
    });
    document.querySelectorAll("[data-i18n-alt]").forEach((element) => {
      element.setAttribute("alt", t(element.dataset.i18nAlt));
    });

    // 💡 2. Supabase에서 불러온 시설 목록(이름 및 설명) 동적 다국어 번역 반영
    document.querySelectorAll(".facility-choice").forEach((button) => {
      const facilityKey = button.dataset.facility; // 예: 'toilet', 'cafe' 등
      if (facilityKey) {
        const nameEl = button.querySelector(".facility-name-text");
        if (nameEl) {
          const translatedName = t(facilityKey);
          if (translatedName !== facilityKey) {
            nameEl.textContent = translatedName;
          }
        }
      }
    });

    // 만약 모달이 열려있다면 선택된 시설 이름과 설명도 언어별로 실시간 변경
    const selectedNameEl = document.getElementById("selectedFacilityName");
    const descTextEl = document.getElementById("facilityDescText");
    if (selectedNameEl && selectedNameEl.dataset.key) {
      const currentKey = selectedNameEl.dataset.key;
      selectedNameEl.textContent = t(currentKey);
    }
    if (descTextEl && descTextEl.dataset.descKey) {
      const currentDescKey = descTextEl.dataset.descKey;
      descTextEl.textContent = t(currentDescKey);
    }

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAria));
    });

    const languageLabel = document.querySelector('label[for="languageSelect"]');
    const languageSelect = document.getElementById("languageSelect");
    if (languageLabel)
      languageLabel.textContent = {
        ko: "언어 선택",
        en: "Select language",
        ja: "言語を選択",
        zh: "选择语言",
      }[lang];
    if (languageSelect)
      languageSelect.setAttribute(
        "aria-label",
        languageLabel ? languageLabel.textContent : "Select language",
      );

    const lobbyExtras = {
      ".pin-clear": "clear",
      ".pin-confirm": "confirm",
      "#pinStep .admin-modal-label": "adminSettingLabel",
      "#modeStep .admin-modal-label": "robotModeLabel",
      "#modeStep .admin-modal-header h2": "robotModeSettings",
      "#modeStep .admin-modal-header p": "chooseMode",
      ".current-mode-box > span": "currentSelection",
      '.mode-option[data-mode="kiosk"] .mode-option-text strong': "kioskMode",
      '.mode-option[data-mode="kiosk"] .mode-option-text span': "kioskModeDesc",
      '.mode-option[data-mode="drive"] .mode-option-text strong': "driveMode",
      '.mode-option[data-mode="drive"] .mode-option-text span': "driveModeDesc",
    };
    if (page === "lobby") {
      Object.entries(lobbyExtras).forEach(([selector, key]) => {
        document
          .querySelectorAll(selector)
          .forEach((element) => setText(element, t(key)));
      });
      const selected = document.getElementById("selectedModeText");
      if (selected)
        setText(
          selected,
          t(
            localStorage.getItem("robotMode") === "drive"
              ? "driveMode"
              : "kioskMode",
          ),
        );
    }

    if (page === "greenhouse") {
      document
        .querySelectorAll(".frame-option strong")
        .forEach((element, index) => {
          setText(element, `${t("frame")} ${index + 1}`);
        });
      const title = document.querySelector(".camera-modal-header span");
      if (title) setText(title, t("photoExperienceLabel"));
      const frameLabel = document.querySelector(".frame-panel-title span");
      if (frameLabel) setText(frameLabel, t("photoFrameLabel"));
    }

    if (page === "exhibitions") {
      const closeButton = document.querySelector(".exhibition-modal-close");
      if (closeButton)
        closeButton.setAttribute("aria-label", t("closeExhibition"));
      const poster = document.getElementById("modalExhibitionImage");
      if (poster && !poster.alt) poster.alt = t("exhibitionPoster");
      const description = document.getElementById("modalExhibitionDescription");
      if (
        description &&
        (!description.textContent.trim() ||
          description.textContent.trim() ===
            "전시 상세 내용을 준비하고 있습니다.")
      ) {
        description.textContent = t("noDescription");
      }
    }

    const selector = document.getElementById("languageSelect");
    if (selector && selector.value !== lang) selector.value = lang;
  }

  function setLanguage(lang) {
    if (!supported.includes(lang)) return;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (_) {}
    applyTranslations();
    window.dispatchEvent(new Event("arboretum:languagechange"));
  }

  // 언어 선택 드롭다운이 바뀌면 바로 적용
  document.addEventListener("change", (event) => {
    if (event.target && event.target.id === "languageSelect") {
      setLanguage(event.target.value);
    }
  });

  window.ArboretumI18n = {
    t,
    language,
    apply: applyTranslations,
    setLanguage,
    translations,
  };

  window.addEventListener("languagechange", applyTranslations);
  document.addEventListener("DOMContentLoaded", applyTranslations);
  applyTranslations();
})();
