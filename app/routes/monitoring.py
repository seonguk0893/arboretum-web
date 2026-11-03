"""관제 모니터링 (로봇 2대 상태 대시보드)

흐름
  로봇  --POST-->  /monitoring/api/robots/<robot_id>/state   (상태 전송)
  관제 화면 --GET-->  /monitoring/api/robots                  (2초마다 조회)

지금은 로봇이 보낸 값을 서버 메모리에 보관한다.
나중에 DB(Supabase 의 robot_status 테이블)로 바꿀 때는
`store_state()` 와 `read_robots()` 두 함수만 바꾸면 된다.
(여러 프로세스로 실행하면 메모리가 공유되지 않으므로 DB 로 옮겨야 한다.)

로봇이 보내는 JSON 예시
{
  "status": "MOVING",              # IDLE | MOVING | ARRIVED | RETURNING | STOPPED | ERROR
  "battery": 82,                   # 0 ~ 100
  "charging": false,
  "current_location": "로비",
  "target_name": "화장실",
  "target_type": "facility",
  "current_service": "시설 안내",
  "mode": "drive",                 # 로비로봇만: kiosk | drive
  "request": {"id": 12, "command": "MOVE", "status": "RUNNING"},
  "emergency_stop": false,
  "safety_alerts": ["crowd"],      # crowd | restricted_area | pet | bicycle
  "alerts": [{"level": "warning", "message": "직접 알릴 문구"}]
}
"""

import json
import os
import threading
import time
from datetime import datetime, timezone
from pathlib import Path

from flask import Blueprint, abort, jsonify, render_template, request


monitoring_bp = Blueprint("monitoring", __name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# 값을 넣어 두면 로봇은 X-Robot-Token 헤더에 같은 값을 보내야 한다.
# 비워 두면 토큰 없이도 받는다(개발용). 운영 전에는 반드시 설정할 것.
ROBOT_API_TOKEN = os.environ.get("ROBOT_API_TOKEN", "")

SAFETY_TYPES = {"crowd", "restricted_area", "pet", "bicycle"}
ALERT_LEVELS = {"warning", "critical"}
MODES = {"kiosk", "drive"}


def load_robot_info():
    with open(DATA_DIR / "robots.json", encoding="utf-8") as file:
        return json.load(file)["robots"]


ROBOT_INFO = load_robot_info()
ROBOT_IDS = {robot["robot_id"] for robot in ROBOT_INFO}

_lock = threading.Lock()
_states = {}  # robot_id -> {"state": dict, "received_at": float}


# ---------------------------------------------------------
# 값 정리 (로봇에서 온 값은 그대로 믿지 않는다)
# ---------------------------------------------------------

def _text(value, limit=60):
    if value is None:
        return None
    return str(value).strip()[:limit] or None


def _number(value, low, high):
    try:
        number = float(value)
    except (TypeError, ValueError):
        return None
    return max(low, min(high, number))


def clean_state(payload):
    payload = payload if isinstance(payload, dict) else {}

    battery = _number(payload.get("battery"), 0, 100)

    request_info = payload.get("request")
    if isinstance(request_info, dict):
        request_info = {
            "id": _text(request_info.get("id"), 20),
            "command": _text(request_info.get("command"), 12),
            "status": _text(request_info.get("status"), 12),
        }
    else:
        request_info = None

    safety = payload.get("safety_alerts")
    safety = [item for item in safety if item in SAFETY_TYPES] if isinstance(safety, list) else []

    alerts = []
    if isinstance(payload.get("alerts"), list):
        for item in payload["alerts"][:10]:
            if isinstance(item, dict) and item.get("level") in ALERT_LEVELS:
                message = _text(item.get("message"), 100)
                if message:
                    alerts.append({"level": item["level"], "message": message})

    mode = payload.get("mode")

    return {
        "status": (_text(payload.get("status"), 20) or "").upper() or None,
        "battery": None if battery is None else round(battery),
        "charging": bool(payload.get("charging")),
        "current_location": _text(payload.get("current_location")),
        "target_name": _text(payload.get("target_name")),
        "target_type": _text(payload.get("target_type"), 20),
        "current_service": _text(payload.get("current_service")),
        "mode": mode if mode in MODES else None,
        "request": request_info,
        "emergency_stop": bool(payload.get("emergency_stop")),
        "safety_alerts": safety,
        "alerts": alerts,
    }


# ---------------------------------------------------------
# 저장 / 조회  (나중에 DB 로 바꿀 부분)
# ---------------------------------------------------------

def store_state(robot_id, state):
    with _lock:
        _states[robot_id] = {"state": state, "received_at": time.time()}


def read_robots():
    now = time.time()
    robots = []

    with _lock:
        for info in ROBOT_INFO:
            saved = _states.get(info["robot_id"])
            robots.append({
                **info,
                "state": saved["state"] if saved else None,
                # 로봇 시계가 아니라 서버 시계 기준으로 "몇 초 전에 받았는지" 계산
                "age_sec": round(now - saved["received_at"], 1) if saved else None,
            })

    return robots


# ---------------------------------------------------------
# 페이지 / API
# ---------------------------------------------------------

@monitoring_bp.route("/", strict_slashes=False)
def dashboard():
    return render_template("monitoring/dashboard.html")


@monitoring_bp.route("/api/robots")
def robots_api():
    return jsonify({
        "server_time": datetime.now(timezone.utc).isoformat(),
        "robots": read_robots(),
    })


@monitoring_bp.route("/api/robots/<robot_id>/state", methods=["POST"])
def receive_state(robot_id):
    if ROBOT_API_TOKEN and request.headers.get("X-Robot-Token") != ROBOT_API_TOKEN:
        abort(401)

    if robot_id not in ROBOT_IDS:
        abort(404)

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"ok": False, "message": "JSON 객체를 보내 주세요."}), 400

    store_state(robot_id, clean_state(payload))
    return jsonify({"ok": True})
