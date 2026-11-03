/* =========================================================
   monitoring.js - 관제 모니터링 대시보드
   ---------------------------------------------------------
   하는 일
   1) 2초마다 /monitoring/api/robots 에서 로봇 상태를 받아온다.
      (로봇이 보낸 값은 서버가 보관했다가 이 API 로 돌려준다)
   2) 로봇마다 "정상 / 주의 / 이상 / 수신 대기"를 판단한다. (evaluate)
   3) 이상·주의가 있으면 화면 위 빨간 배너와 카드 안에 문구를 크게 표시한다.
   4) 발생·해제된 알림을 "알림 이력"에 쌓는다.

   이상 상황 기준은 아래 CONFIG 와 evaluate() 에서 바꾼다.
   (기획서: 알림 대상 상황은 추후 확정 → 이 값만 고치면 된다)

   주소 끝에 ?demo=1 을 붙이면 로봇 없이도 가짜 데이터와 데모 패널로
   이상 상황 화면을 미리 확인할 수 있다.
   ========================================================= */

(() => {
  /* =======================================================
     설정
  ======================================================= */

  const CONFIG = {
    API_URL: "/monitoring/api/robots",
    POLL_MS: 5000, // 서버에서 값을 받아오는 간격
    TICK_MS: 5000, // 화면의 "n초 전" 갱신 간격
    FETCH_TIMEOUT_MS: 4000,
    FEED_LOST_AFTER_FAILS: 2, // 이만큼 연속 실패하면 "서버 통신 끊김"
    OFFLINE_AFTER_SEC: 10, // 이 시간 동안 로봇 값이 안 오면 "연결 끊김"
    LOW_BATTERY: 20, // 이하이면 주의
    CRITICAL_BATTERY: 10, // 이하이면 이상
    HISTORY_MAX: 50,
  };

  const IS_DEMO = new URLSearchParams(location.search).get("demo") === "1";

  /* =======================================================
     표시용 문구
  ======================================================= */

  const STATUS_LABEL = {
    IDLE: "대기",
    MOVING: "이동 중",
    ARRIVED: "도착",
    RETURNING: "복귀 중",
    STOPPED: "정지",
    ERROR: "오류",
  };

  const REQUEST_STATUS_LABEL = {
    WAIT: "대기",
    RUNNING: "이동 중",
    ARRIVED: "도착",
    DONE: "완료",
    ERROR: "오류",
    CANCEL: "취소",
  };

  const COMMAND_LABEL = { MOVE: "이동", RETURN: "복귀" };

  const MODE_LABEL = { kiosk: "키오스크 모드", drive: "주행 모드" };

  // 진행보고 6쪽 안전경보 4종
  const SAFETY_LABEL = {
    crowd: "관람객 밀집",
    restricted_area: "제한구역 침입",
    pet: "반려동물 진입",
    bicycle: "자전거·킥보드 진입",
  };

  const LEVEL_LABEL = {
    ok: "정상",
    warning: "주의",
    critical: "이상",
    waiting: "수신 대기",
  };

  const LEVEL_RANK = { waiting: 0, ok: 1, warning: 2, critical: 3 };

  /* =======================================================
     요소
  ======================================================= */

  const $ = (id) => document.getElementById(id);

  const grid = $("robotGrid");
  const cardTemplate = $("robotCardTemplate");
  const banner = $("alertBanner");
  const bannerTitle = $("alertBannerTitle");
  const bannerList = $("alertBannerList");
  const feedStatus = $("feedStatus");
  const feedStatusText = $("feedStatusText");
  const historyBody = $("historyBody");
  const historyEmpty = $("historyEmpty");
  const historyCount = $("historyCount");

  /* =======================================================
     상태
  ======================================================= */

  let robots = []; // 서버에서 받은 로봇 목록 (+ fetchedAt)
  let feedFails = 0;
  let history = []; // 알림 이력 (최신이 앞)
  const activeEntries = new Map(); // 발생 중인 알림 key -> 이력 항목
  const cards = new Map(); // robot_id -> 카드 요소

  /* =======================================================
     유틸
  ======================================================= */

  function formatAge(seconds) {
    const s = Math.max(0, Math.floor(seconds));

    if (s < 60) return `${s}초`;
    if (s < 3600) return `${Math.floor(s / 60)}분 ${s % 60}초`;
    return `${Math.floor(s / 3600)}시간 ${Math.floor((s % 3600) / 60)}분`;
  }

  function formatClock(date) {
    return date.toLocaleTimeString("ko-KR", { hour12: false });
  }

  // 서버가 알려 준 "n초 전 수신" + 그 뒤로 화면에서 흐른 시간
  function currentAge(robot) {
    if (robot.age_sec === null || robot.age_sec === undefined) {
      return null;
    }

    return robot.age_sec + (performance.now() - robot.fetchedAt) / 1000;
  }

  /* =======================================================
     이상 상황 판단
     ---------------------------------------------------------
     반환: { level, connected, age, alerts: [{ key, level, message }] }
       level: "waiting" | "ok" | "warning" | "critical"
  ======================================================= */

  function evaluate(robot) {
    const state = robot.state;
    const age = currentAge(robot);

    // 로봇이 아직 한 번도 값을 보내지 않음
    if (!state || age === null) {
      return { level: "waiting", connected: false, age: null, alerts: [] };
    }

    const alerts = [];
    const add = (key, level, message) =>
      alerts.push({ key: `${robot.robot_id}:${key}`, level, message });

    const connected = age <= CONFIG.OFFLINE_AFTER_SEC;

    if (!connected) {
      // 연결이 끊기면 마지막 값은 믿을 수 없으므로 이 알림 하나만 낸다.
      add(
        "offline",
        "critical",
        `로봇과 연결이 끊겼습니다 (마지막 수신 ${formatAge(age)} 전)`,
      );
    } else {
      // ----- 이상 (빨간색) -----
      if (state.emergency_stop) {
        add("emergency", "critical", "비상정지 스위치가 눌렸습니다");
      }

      if (state.status === "ERROR") {
        add("error", "critical", "로봇에 오류가 발생했습니다");
      }

      if (state.request && state.request.status === "ERROR") {
        add(
          "request-error",
          "critical",
          `이동 요청이 오류로 중단되었습니다${state.request.id ? ` (#${state.request.id})` : ""}`,
        );
      }

      if (
        state.battery !== null &&
        state.battery !== undefined &&
        !state.charging
      ) {
        if (state.battery <= CONFIG.CRITICAL_BATTERY) {
          add(
            "battery",
            "critical",
            `배터리가 매우 부족합니다 (${state.battery}%)`,
          );
        } else if (state.battery <= CONFIG.LOW_BATTERY) {
          add("battery", "warning", `배터리가 부족합니다 (${state.battery}%)`);
        }
      }

      // ----- 주의 (주황색): 안전경보 -----
      (state.safety_alerts || []).forEach((type) => {
        add(`safety-${type}`, "warning", `${SAFETY_LABEL[type] || type} 감지`);
      });

      // ----- 로봇이 직접 보낸 알림 -----
      (state.alerts || []).forEach((item, index) => {
        add(`custom-${index}`, item.level, item.message);
      });
    }

    let level = "ok";
    alerts.forEach((alert) => {
      if (LEVEL_RANK[alert.level] > LEVEL_RANK[level]) level = alert.level;
    });

    return { level, connected, age, alerts };
  }

  /* =======================================================
     카드 만들기 / 갱신
  ======================================================= */

  function field(card, name) {
    return card.querySelector(`[data-field="${name}"]`);
  }

  function buildCard(robot) {
    const card = cardTemplate.content.firstElementChild.cloneNode(true);

    field(card, "name").textContent = robot.name;
    field(card, "role").textContent = robot.role;
    field(card, "area").textContent = robot.area;

    // 운영 모드는 로비로봇만 있음
    card.querySelector('[data-row="mode"]').hidden = !robot.has_mode;

    card.setAttribute("aria-label", `${robot.name} 상태`);
    card.dataset.robotId = robot.robot_id;

    cards.set(robot.robot_id, card);
    grid.append(card);

    return card;
  }

  function setText(card, name, value) {
    const element = field(card, name);

    if (element) {
      element.textContent =
        value === null || value === undefined || value === "" ? "-" : value;
    }
  }

  function describeRequest(request) {
    if (!request) return "-";

    const command = COMMAND_LABEL[request.command] || request.command || "";
    const status = REQUEST_STATUS_LABEL[request.status] || request.status || "";
    const id = request.id ? `#${request.id}` : "";

    return [id, command, status].filter(Boolean).join(" · ") || "-";
  }

  function updateCard(robot, result) {
    const card = cards.get(robot.robot_id) || buildCard(robot);
    const state = robot.state || {};
    const { level, connected, age, alerts } = result;

    // 카드 단계(색)
    card.classList.remove(
      "level-ok",
      "level-warning",
      "level-critical",
      "level-waiting",
    );
    card.classList.add(`level-${level}`);

    setText(card, "level", LEVEL_LABEL[level]);

    const connection = field(card, "connection");
    connection.classList.toggle("connected", level !== "waiting" && connected);
    connection.classList.toggle(
      "disconnected",
      level !== "waiting" && !connected,
    );
    connection.textContent =
      level === "waiting" ? "수신 대기" : connected ? "연결됨" : "연결 끊김";

    // 이 로봇의 이상 문구
    const alertList = field(card, "alerts");
    alertList.replaceChildren();

    alerts.forEach((alert) => {
      const item = document.createElement("li");
      item.className = alert.level;
      item.textContent = alert.message;
      alertList.append(item);
    });

    alertList.hidden = alerts.length === 0;

    // 배터리
    const battery = state.battery;
    const hasBattery = battery !== null && battery !== undefined;
    const batteryBox = card.querySelector(".battery");

    setText(card, "battery", hasBattery ? battery : null);
    field(card, "batteryBar").style.width = hasBattery ? `${battery}%` : "0%";
    field(card, "charging").textContent =
      level === "waiting" ? "" : state.charging ? "⚡ 충전 중" : "충전 안 함";

    batteryBox.classList.toggle(
      "critical",
      hasBattery && !state.charging && battery <= CONFIG.CRITICAL_BATTERY,
    );
    batteryBox.classList.toggle(
      "low",
      hasBattery &&
        !state.charging &&
        battery > CONFIG.CRITICAL_BATTERY &&
        battery <= CONFIG.LOW_BATTERY,
    );

    // 상태 정보
    setText(card, "status", STATUS_LABEL[state.status] || state.status);
    field(card, "status").classList.toggle(
      "is-error",
      state.status === "ERROR",
    );
    setText(card, "location", state.current_location);
    setText(card, "target", state.target_name);
    setText(card, "service", state.current_service);
    setText(card, "mode", MODE_LABEL[state.mode] || state.mode);
    setText(card, "request", describeRequest(state.request));

    // 마지막 수신
    const updated = field(card, "updated");
    updated.textContent =
      age === null ? "수신 이력 없음" : `${formatAge(age)} 전`;
    updated.classList.toggle("is-stale", age !== null && !connected);
  }

  /* =======================================================
     요약 / 배너 / 제목
  ======================================================= */

  function updateSummary(results) {
    const count = { ok: 0, warning: 0, critical: 0 };

    results.forEach(({ result }) => {
      if (count[result.level] !== undefined) count[result.level] += 1;
    });

    $("sumTotal").textContent = results.length;
    $("sumOk").textContent = count.ok;
    $("sumWarning").textContent = count.warning;
    $("sumCritical").textContent = count.critical;

    document
      .querySelector(".summary-item.warning")
      .classList.toggle("active", count.warning > 0);
    document
      .querySelector(".summary-item.critical")
      .classList.toggle("active", count.critical > 0);
  }

  function updateBanner(all) {
    // all: [{ robotName, key, level, message }]
    const critical = all.filter((item) => item.level === "critical").length;
    const warning = all.length - critical;

    banner.hidden = all.length === 0;
    banner.classList.toggle("warning", all.length > 0 && critical === 0);

    bannerTitle.textContent =
      critical > 0
        ? `이상 상황 ${critical}건이 발생했습니다${warning > 0 ? ` (주의 ${warning}건 포함)` : ""}`
        : `주의가 필요한 상황 ${warning}건이 있습니다`;

    bannerList.replaceChildren();

    // 이상(빨강)을 먼저
    [...all]
      .sort((a, b) => LEVEL_RANK[b.level] - LEVEL_RANK[a.level])
      .forEach((item) => {
        const li = document.createElement("li");
        const who = document.createElement("b");

        who.textContent = `[${item.robotName}]`;
        li.append(who, item.message);
        bannerList.append(li);
      });

    // 탭 제목에도 표시해서 다른 탭을 보고 있어도 알 수 있게
    document.title =
      all.length > 0
        ? `(!) ${critical > 0 ? `이상 ${critical}` : `주의 ${warning}`}건 · 관제 모니터링`
        : "관제 모니터링 | 세종국립수목원 로봇";
  }

  function updateFeedStatus() {
    const lost = feedFails >= CONFIG.FEED_LOST_AFTER_FAILS;

    feedStatus.classList.toggle("lost", lost);
    feedStatus.classList.toggle("live", !lost && robots.length > 0);
    feedStatusText.textContent = lost
      ? "서버 통신 끊김"
      : robots.length > 0
        ? IS_DEMO
          ? "데모 데이터"
          : "실시간 수신 중"
        : "연결 확인 중";

    return lost;
  }

  /* =======================================================
     알림 이력
  ======================================================= */

  function recordHistory(all) {
    const now = new Date();
    const currentKeys = new Set(all.map((item) => item.key));

    // 새로 생긴 알림
    all.forEach((item) => {
      if (!activeEntries.has(item.key)) {
        const entry = {
          key: item.key,
          robotName: item.robotName,
          level: item.level,
          message: item.message,
          startedAt: now,
          resolvedAt: null,
        };

        activeEntries.set(item.key, entry);
        history.unshift(entry);
      } else {
        // 같은 알림이 계속되는 동안 내용(수치 등)만 갱신
        const entry = activeEntries.get(item.key);
        entry.level = item.level;
        entry.message = item.message;
      }
    });

    // 사라진 알림은 해제 처리
    [...activeEntries.keys()].forEach((key) => {
      if (!currentKeys.has(key)) {
        activeEntries.get(key).resolvedAt = now;
        activeEntries.delete(key);
      }
    });

    history = history.slice(0, CONFIG.HISTORY_MAX);
  }

  function renderHistory() {
    historyBody.replaceChildren();

    history.forEach((entry) => {
      const row = document.createElement("tr");
      const active = entry.resolvedAt === null;

      row.className = `${active ? "active" : ""} ${entry.level}`.trim();

      const cells = [
        [formatClock(entry.startedAt), ""],
        [entry.robotName, ""],
        [LEVEL_LABEL[entry.level], `level ${entry.level}`],
        [entry.message, ""],
        [
          active ? "발생 중" : `해제 ${formatClock(entry.resolvedAt)}`,
          `state${active ? " active" : ""}`,
        ],
      ];

      cells.forEach(([text, className]) => {
        const cell = document.createElement("td");

        cell.textContent = text;
        if (className) cell.className = className;
        row.append(cell);
      });

      historyBody.append(row);
    });

    historyEmpty.hidden = history.length > 0;
    historyCount.textContent = `${history.length}건`;
  }

  /* =======================================================
     화면 전체 다시 그리기
  ======================================================= */

  function render() {
    const results = robots.map((robot) => ({ robot, result: evaluate(robot) }));
    const all = [];

    results.forEach(({ robot, result }) => {
      updateCard(robot, result);

      result.alerts.forEach((alert) =>
        all.push({ ...alert, robotName: robot.name }),
      );
    });

    // 관제 서버와 통신이 끊긴 것도 이상 상황
    if (updateFeedStatus()) {
      all.push({
        key: "system:feed",
        level: "critical",
        robotName: "관제",
        message:
          "관제 서버와 통신할 수 없습니다. 표시된 값은 마지막으로 받은 값입니다.",
      });
    }

    updateSummary(results);
    updateBanner(all);
    recordHistory(all);
    renderHistory();
  }

  /* =======================================================
     데이터 받아오기
  ======================================================= */

  async function fetchRobots() {
    if (IS_DEMO) {
      return DemoFeed.read();
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(CONFIG.API_URL, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function poll() {
    try {
      const data = await fetchRobots();
      const fetchedAt = performance.now();

      robots = (data.robots || []).map((robot) => ({ ...robot, fetchedAt }));
      feedFails = 0;
    } catch (error) {
      feedFails += 1;
      console.warn("로봇 상태를 받아오지 못했습니다.", error);
    }

    render();
  }

  /* =======================================================
     데모 (?demo=1)
     ---------------------------------------------------------
     서버 API 와 같은 모양의 가짜 데이터를 만들어 준다.
  ======================================================= */

  const DemoFeed = (() => {
    const INFO = [
      {
        robot_id: "greenhouse_robot",
        name: "온실로봇",
        role: "도슨트 로봇",
        area: "사계절전시온실 · 전시 해설",
        has_mode: false,
      },
      {
        robot_id: "lobby_robot",
        name: "로비로봇",
        role: "서비스 로봇",
        area: "사계절전시온실 로비 · 시설 안내",
        has_mode: true,
      },
    ];

    const SCENARIOS = [
      ["offline", "연결 끊김"],
      ["battery", "배터리 부족"],
      ["emergency", "비상정지"],
      ["error", "로봇 오류"],
      ["crowd", "관람객 밀집"],
      ["restricted_area", "제한구역 침입"],
      ["pet", "반려동물 진입"],
      ["bicycle", "자전거·킥보드"],
    ];

    const flags = {};
    const offlineSince = {};
    let tick = 0;

    INFO.forEach((robot) => (flags[robot.robot_id] = {}));

    function build(robot) {
      const f = flags[robot.robot_id];
      const lobby = robot.robot_id === "lobby_robot";
      const moving = tick % 20 >= 6 && tick % 20 < 14;

      let battery = lobby
        ? 82 - Math.floor(tick / 30)
        : 64 - Math.floor(tick / 30);
      if (f.battery) battery = 14;

      const state = {
        status: f.error ? "ERROR" : moving ? "MOVING" : "IDLE",
        battery: Math.max(0, battery),
        charging: false,
        current_location: moving ? "이동 중" : lobby ? "로비" : "온실 입구",
        target_name: moving ? (lobby ? "화장실" : "온실A 전시") : null,
        target_type: moving ? (lobby ? "facility" : "exhibition") : null,
        current_service: lobby ? "시설 안내" : "전시 해설",
        mode: lobby ? "drive" : null,
        request: moving
          ? { id: lobby ? 12 : 13, command: "MOVE", status: "RUNNING" }
          : null,
        emergency_stop: Boolean(f.emergency),
        safety_alerts: ["crowd", "restricted_area", "pet", "bicycle"].filter(
          (type) => f[type],
        ),
        alerts: [],
      };

      let age = 0.4;

      if (f.offline) {
        // 버튼을 누르면 바로 "연결 끊김" 알림이 보이도록 이미 끊긴 시점부터 시작
        offlineSince[robot.robot_id] =
          offlineSince[robot.robot_id] ??
          performance.now() - (CONFIG.OFFLINE_AFTER_SEC + 1) * 1000;
        age = (performance.now() - offlineSince[robot.robot_id]) / 1000;
      } else {
        delete offlineSince[robot.robot_id];
      }

      return { ...robot, state, age_sec: age };
    }

    function read() {
      tick += 1;
      return { robots: INFO.map(build) };
    }

    function setupPanel() {
      $("demoChip").hidden = false;
      $("demoPanel").hidden = false;

      const columns = $("demoColumns");

      INFO.forEach((robot) => {
        const column = document.createElement("div");
        const title = document.createElement("h3");
        const buttons = document.createElement("div");

        column.className = "demo-column";
        buttons.className = "demo-buttons";
        title.textContent = robot.name;

        SCENARIOS.forEach(([key, label]) => {
          const button = document.createElement("button");

          button.type = "button";
          button.textContent = label;
          button.setAttribute("aria-pressed", "false");
          button.dataset.robot = robot.robot_id;
          button.dataset.flag = key;

          button.addEventListener("click", () => {
            flags[robot.robot_id][key] = !flags[robot.robot_id][key];
            button.setAttribute(
              "aria-pressed",
              String(Boolean(flags[robot.robot_id][key])),
            );
            poll();
          });

          buttons.append(button);
        });

        column.append(title, buttons);
        columns.append(column);
      });

      $("demoReset").addEventListener("click", () => {
        Object.keys(flags).forEach((id) => (flags[id] = {}));
        document
          .querySelectorAll(".demo-buttons button")
          .forEach((button) => button.setAttribute("aria-pressed", "false"));
        poll();
      });
    }

    return { read, setupPanel };
  })();

  /* =======================================================
     시작
  ======================================================= */

  function start() {
    if (IS_DEMO) {
      DemoFeed.setupPanel();
    }

    // 로봇 카드는 첫 응답에서 만든다.
    grid.replaceChildren();

    poll();
    setInterval(poll, CONFIG.POLL_MS);
    setInterval(render, CONFIG.TICK_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }

  // 로봇 쪽 연동·테스트에서 쓸 수 있도록 판단 함수를 노출
  window.Monitoring = { CONFIG, evaluate };
})();
