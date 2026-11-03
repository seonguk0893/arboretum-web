from flask import Blueprint, request, jsonify, render_template, url_for
from .database import get_facilities_from_db, supabase_client, save_survey_response

lobby_bp = Blueprint("lobby", __name__)


@lobby_bp.route("/", strict_slashes=False)
def index():
    return render_template("lobby/index.html")


@lobby_bp.route("/facilities")
def facilities():
    # 1. DB에서 데이터 불러오기 시도
    facilities_data = get_facilities_from_db(supabase_client)
    
    # 2. DB를 못 불러왔거나 데이터가 비어있을 때만 기본값 사용
    if not facilities_data:
        print("[LOBBY] DB 연결 실패 또는 데이터 없음. 기본값 데이터를 사용합니다.")
        facilities_data = [
            {
                "id": 1,
                "key": "toilet",
                "name": "정문 안내 화장실",
                "location_description": "정문 광장 오른쪽",
                "coord_x": 37.566535,
                "coord_y": 126.977969,
                "is_open": True
            },
            {
                "id": 2,
                "key": "cafe",
                "name": "숲속 힐링 카페",
                "location_description": "산책로 C코스 중간",
                "coord_x": 37.566821,
                "coord_y": 126.978512,
                "is_open": True
            },
            {
                "id": 3,
                "key": "convenience",
                "name": "중앙 광장 편의점",
                "location_description": "방문객 센터 내",
                "coord_x": 37.566210,
                "coord_y": 126.977110,
                "is_open": True
            },
            {
                "id": 4,
                "key": "infirmary",
                "name": "방문객 센터 의무실",
                "location_description": "본관 1층 안내데스크 옆",
                "coord_x": 37.566150,
                "coord_y": 126.977050,
                "is_open": True
            },
            {
                "id": 5,
                "key": "nursing",
                "name": "본관 수유실",
                "location_description": "본관 1층 화장실 옆",
                "coord_x": 37.566160,
                "coord_y": 126.977080,
                "is_open": True
            },
            {
                "id": 6,
                "key": "education",
                "name": "어린이 교육체험공간",
                "location_description": "생태학습관 2층",
                "coord_x": 37.567120,
                "coord_y": 126.979120,
                "is_open": True
            },
            {
                "id": 7,
                "key": "entrance",
                "name": "중앙 정문",
                "location_description": "수목원 남쪽 주차장 앞",
                "coord_x": 37.565980,
                "coord_y": 126.977320,
                "is_open": True
            }
        ]

    return render_template(
        "facilities/index.html",
        source="lobby",
        facilities=facilities_data,
        back_url=url_for("lobby.index"),
    )

@lobby_bp.route("/api/survey-responses", methods=["POST"])
def create_survey_response():
    data = request.get_json(silent=True) or {}

    try:
        satisfaction = data.get("satisfaction")
        easy_to_understand = data.get("easy_to_understand")
        reuse = data.get("reuse")

        # JSON에서 전달된 만족도는 문자열일 수도 있으므로 정수로 변환
        if isinstance(satisfaction, bool):
            raise ValueError("만족도는 1~5점 중 하나여야 합니다.")

        satisfaction = int(satisfaction)

        save_survey_response(
            satisfaction=satisfaction,
            easy_to_understand=easy_to_understand,
            reuse=reuse,
        )

        return jsonify({
            "success": True,
            "message": "설문이 저장되었습니다.",
        }), 201

    except (ValueError, TypeError):
        return jsonify({
            "error": "설문 응답을 확인해 주세요.",
        }), 400

    except Exception:
        from flask import current_app
        current_app.logger.exception("설문 저장 중 오류 발생")

        return jsonify({
            "error": "설문 저장 중 서버 오류가 발생했습니다.",
        }), 500
        
@lobby_bp.route("/events")
def events():
    return render_template("lobby/events.html")
