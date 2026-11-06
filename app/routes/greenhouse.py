
import base64
import os
import re
import secrets
import threading
import time

from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

from flask import (
    Blueprint,
    render_template,
    jsonify,
    request,
    Response,
    url_for,
    send_from_directory,
    render_template_string,
    abort,
    current_app,
)

from .database import get_facilities_from_db, supabase_client


greenhouse_bp = Blueprint(
    "greenhouse",
    __name__,
    url_prefix="/greenhouse",
)


# =========================================================
# 환경 설정
# =========================================================

TYPECAST_API_KEY = "__pltVDgHGsY6Zf9Kr5VJQboHrvMWuCUZu2VY5oadbof9"

TYPECAST_HEADERS = {
    "X-API-KEY": TYPECAST_API_KEY,
    "Content-Type": "application/json"

}

VOICE_ID = "tc_666a9871abcf27a5169850d0"


def get_typecast_api_key():
    """상단 환경 설정에 선언된 Typecast API 키를 반환한다."""
    return TYPECAST_API_KEY


SUPPORTED_LANGUAGES = {"ko", "en", "ja", "zh"}


# =========================================================
# 공통 유틸리티
# =========================================================

def get_request_language():
    """요청 언어를 검증하고 기본값 ko를 반환한다."""
    language = (
        request.args.get("language")
        or request.headers.get("X-Language")
        or "ko"
    ).lower()

    return language if language in SUPPORTED_LANGUAGES else "ko"


def normalize_json_array(value):
    """Supabase JSONB 배열 데이터를 안전하게 리스트로 변환한다."""
    if isinstance(value, list):
        return value

    if value is None:
        return []

    return [value]


# =========================================================
# 페이지
# =========================================================

@greenhouse_bp.route("/", strict_slashes=False)
def index():
    return render_template("greenhouse/index.html")


@greenhouse_bp.route("/exhibitions")
def exhibitions():
    return render_template("greenhouse/exhibitions.html")


@greenhouse_bp.route("/facilities")
def facilities():
    facilities_data = get_facilities_from_db(supabase_client)

    if not facilities_data:
        current_app.logger.warning(
            "[GREENHOUSE] DB 데이터가 없어 기본 시설 데이터를 사용합니다."
        )

        facilities_data = [
            {
                "id": 1,
                "key": "toilet",
                "name": "정문 안내 화장실",
                "location_description": "정문 광장 오른쪽",
                "coord_x": 37.566535,
                "coord_y": 126.977969,
                "is_open": True,
            },
            {
                "id": 2,
                "key": "cafe",
                "name": "숲속 힐링 카페",
                "location_description": "산책로 C코스 중간",
                "coord_x": 37.566821,
                "coord_y": 126.978512,
                "is_open": True,
            },
            {
                "id": 3,
                "key": "convenience",
                "name": "중앙 광장 편의점",
                "location_description": "방문객 센터 내",
                "coord_x": 37.566210,
                "coord_y": 126.977110,
                "is_open": True,
            },
            {
                "id": 4,
                "key": "infirmary",
                "name": "방문객 센터 의무실",
                "location_description": "본관 1층 안내데스크 옆",
                "coord_x": 37.566150,
                "coord_y": 126.977050,
                "is_open": True,
            },
            {
                "id": 5,
                "key": "nursing",
                "name": "본관 수유실",
                "location_description": "본관 1층 화장실 옆",
                "coord_x": 37.566160,
                "coord_y": 126.977080,
                "is_open": True,
            },
            {
                "id": 6,
                "key": "education",
                "name": "어린이 교육체험공간",
                "location_description": "생태학습관 2층",
                "coord_x": 37.567120,
                "coord_y": 126.979120,
                "is_open": True,
            },
            {
                "id": 7,
                "key": "entrance",
                "name": "중앙 정문",
                "location_description": "수목원 남쪽 주차장 앞",
                "coord_x": 37.565980,
                "coord_y": 126.977320,
                "is_open": True,
            },
        ]

    return render_template(
        "facilities/index.html",
        source="greenhouse",
        facilities=facilities_data,
        back_url=url_for("greenhouse.index"),
    )


@greenhouse_bp.route("/events")
def events():
    return render_template("greenhouse/events.html")


# =========================================================
# 전시 해설 API - Supabase
#
# 메인 테이블: public.exhibition_contents
# 번역 테이블: public.exhibition_content_translations
# =========================================================

# =========================================================
# 전시 해설 API - Supabase
# 메인 테이블: public.exhibition_contents
# =========================================================

def get_exhibition_contents(language="ko"):
    """
    Supabase에서 전시 콘텐츠를 조회한다.
    언어별 데이터가 없으면 한국어 데이터로 대체한다.
    """

    if supabase_client is None:
        raise RuntimeError(
            "Supabase 클라이언트가 초기화되지 않았습니다."
        )

    if language not in SUPPORTED_LANGUAGES:
        language = "ko"

    # 1. Supabase 조회를 먼저 실행
    response = (
        supabase_client
        .table("exhibition_contents")
        .select(
            "id, code, content_type, parent_id, zone_no, "
            "sort_order, region_code, region_label, "
            "image_url, title, subtitle, key_message, "
            "body, highlights, is_active"
        )
        .eq("is_active", True)
        .order("sort_order", desc=False)
        .execute()
    )

    # 2. 조회가 끝난 다음 로그 출력
    current_app.logger.info(
        "[EXHIBITIONS] Supabase 조회 결과: %s건",
        len(response.data or [])
    )

    for item in response.data or []:
        current_app.logger.info(
            "[EXHIBITIONS] code=%s, type=%s, active=%s",
            item.get("code"),
            item.get("content_type"),
            item.get("is_active"),
        )

    # 3. 언어별 데이터 변환
    def get_localized_value(value):
        if value is None:
            return ""

        if isinstance(value, str):
            return value

        if isinstance(value, dict):
            return value.get(language) or value.get("ko") or ""

        return ""

    def get_localized_array(value):
        localized = get_localized_value(value)
        return localized if isinstance(localized, list) else []

    # 4. 프론트엔드에서 사용하는 형식으로 변환
    result = []

    for item in response.data or []:
        result.append({
            "id": item.get("id"),
            "code": item.get("code"),
            "type": item.get("content_type"),
            "parentId": item.get("parent_id"),
            "zoneNo": item.get("zone_no"),
            "order": item.get("sort_order") or 0,

            "regionCode": item.get("region_code"),
            "region": get_localized_value(
                item.get("region_label")
            ),

            "image": item.get("image_url") or "",
            "title": get_localized_value(item.get("title")),
            "subtitle": get_localized_value(item.get("subtitle")),
            "keyMessage": get_localized_value(
                item.get("key_message")
            ),

            "body": get_localized_array(item.get("body")),
            "highlights": get_localized_array(
                item.get("highlights")
            ),

            "audio": None,
        })

    return result


@greenhouse_bp.route("/api/exhibitions", methods=["GET"])
def exhibitions_api():
    """전시 해설 콘텐츠 목록 API."""

    language = get_request_language()

    try:
        contents = get_exhibition_contents(language)

        return jsonify({
            "success": True,
            "language": language,
            "count": len(contents),
            "contents": contents,
        }), 200

    except Exception:
        current_app.logger.exception(
            "[EXHIBITIONS] 전시 콘텐츠 조회 실패"
        )

        return jsonify({
            "success": False,
            "language": language,
            "count": 0,
            "contents": [],
            "message": "전시 해설 정보를 불러오지 못했습니다.",
        }), 500


# =========================================================
# 포토존 사진 QR 다운로드
# =========================================================

PHOTO_TTL_SECONDS = 30 * 60
MAX_PHOTO_BYTES = 8 * 1024 * 1024


def get_photo_directory():
    """사진 임시 저장 디렉터리."""
    directory = Path(current_app.instance_path) / "photo_downloads"
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def cleanup_expired_photos():
    """저장된 지 30분이 지난 사진 삭제."""
    directory = get_photo_directory()
    expiration_time = time.time() - PHOTO_TTL_SECONDS

    for photo_path in directory.glob("*.jpg"):
        try:
            if photo_path.stat().st_mtime < expiration_time:
                photo_path.unlink(missing_ok=True)

                current_app.logger.info(
                    "만료된 사진 삭제: %s",
                    photo_path.name,
                )

        except OSError:
            current_app.logger.warning(
                "임시 사진 삭제 실패: %s",
                photo_path.name,
            )


def cleanup_expired_photos_periodically(app):
    """1분마다 만료된 사진을 확인하고 삭제한다."""

    def cleanup_loop():
        while True:
            time.sleep(60)

            try:
                with app.app_context():
                    cleanup_expired_photos()

            except Exception:
                app.logger.exception(
                    "만료된 사진 자동 정리 중 오류 발생"
                )

    thread = threading.Thread(
        target=cleanup_loop,
        daemon=True,
        name="photo-cleanup",
    )

    thread.start()


@greenhouse_bp.route("/api/photo", methods=["POST"])
def upload_photo_for_qr():
    """완성된 사진을 서버에 저장하고 QR 접속 주소를 반환한다."""

    payload = request.get_json(silent=True) or {}
    photo_data_url = payload.get("photo")

    if not isinstance(photo_data_url, str):
        return jsonify({
            "success": False,
            "message": "사진 데이터가 없습니다.",
        }), 400

    match = re.fullmatch(
        r"data:image/jpeg;base64,([A-Za-z0-9+/]*={0,2})",
        photo_data_url,
    )

    if not match:
        return jsonify({
            "success": False,
            "message": "올바른 JPG 사진이 아닙니다.",
        }), 400

    try:
        image_bytes = base64.b64decode(
            match.group(1),
            validate=True,
        )

    except (ValueError, base64.binascii.Error):
        return jsonify({
            "success": False,
            "message": "사진 데이터를 읽을 수 없습니다.",
        }), 400

    if not image_bytes or len(image_bytes) > MAX_PHOTO_BYTES:
        return jsonify({
            "success": False,
            "message": "사진 용량이 너무 큽니다.",
        }), 413

    if not image_bytes.startswith(b"\xff\xd8\xff"):
        return jsonify({
            "success": False,
            "message": "유효한 JPG 파일이 아닙니다.",
        }), 400

    cleanup_expired_photos()

    token = secrets.token_urlsafe(24)

    photo_directory = get_photo_directory()
    photo_path = photo_directory / f"{token}.jpg"

    try:
        photo_path.write_bytes(image_bytes)

    except OSError:
        current_app.logger.exception(
            "사진 임시 저장 실패"
        )

        return jsonify({
            "success": False,
            "message": "사진 저장 중 오류가 발생했습니다.",
        }), 500

    public_base_url = current_app.config.get("PUBLIC_BASE_URL")

    if public_base_url:
        download_url = (
            f"{public_base_url.rstrip('/')}"
            f"{url_for('greenhouse.photo_download_page', token=token)}"
        )

    else:
        base_url = "http://192.168.35.65:5000"

        download_url = (
            f"{base_url.rstrip('/')}"
            f"{url_for('greenhouse.photo_download_page', token=token)}"
        )

    return jsonify({
        "success": True,
        "download_url": download_url,
        "expires_in": PHOTO_TTL_SECONDS,
    })


@greenhouse_bp.route("/photo/<token>")
def photo_download_page(token):
    """휴대폰에서 사진을 확인하고 다운로드하는 페이지."""

    if not re.fullmatch(r"[A-Za-z0-9_-]{20,100}", token):
        abort(404)

    cleanup_expired_photos()

    photo_path = get_photo_directory() / f"{token}.jpg"

    if not photo_path.is_file():
        abort(
            404,
            description="사진 다운로드 시간이 만료되었습니다.",
        )

    image_url = url_for(
        "greenhouse.photo_download_image",
        token=token,
    )

    return render_template_string(
        """
        <!doctype html>
        <html lang="ko">
        <head>
          <meta charset="utf-8">
          <meta name="viewport"
                content="width=device-width, initial-scale=1">
          <meta name="robots" content="noindex,nofollow">
          <title>세종수목원 포토존 사진</title>
          <style>
            * { box-sizing: border-box; }

            body {
              margin: 0;
              padding: 24px 16px;
              background: #f4f8f5;
              color: #20372b;
              font-family: -apple-system, BlinkMacSystemFont,
                           "Segoe UI", sans-serif;
            }

            main {
              max-width: 520px;
              margin: 0 auto;
              padding: 22px;
              background: #fff;
              border-radius: 18px;
            }

            h1 {
              font-size: 23px;
              margin: 0 0 8px;
            }

            p {
              line-height: 1.6;
              color: #5e6c63;
            }

            img {
              display: block;
              width: 100%;
              height: auto;
              margin: 20px 0;
              border-radius: 12px;
            }

            a {
              display: block;
              padding: 16px;
              border-radius: 12px;
              background: #168f68;
              color: white;
              text-align: center;
              text-decoration: none;
              font-weight: 700;
            }

            .notice {
              font-size: 13px;
            }
          </style>
        </head>

        <body>
          <main>
            <h1>수목원 포토존 사진</h1>
            <p>촬영한 사진을 확인하고 휴대폰에 저장해 보세요.</p>

            <img src="{{ image_url }}" alt="촬영한 사진">

            <a href="{{ image_url }}"
               download="sejong-arboretum-photo.jpg">
              사진 다운로드
            </a>

            <p class="notice">
              사진은 개인정보 보호를 위해 일정 시간이 지나면 삭제됩니다.
            </p>
          </main>
        </body>
        </html>
        """,
        image_url=image_url,
    )


@greenhouse_bp.route("/photo/<token>/image")
def photo_download_image(token):
    """사진 미리보기 및 다운로드용 이미지 제공."""

    if not re.fullmatch(r"[A-Za-z0-9_-]{20,100}", token):
        abort(404)

    cleanup_expired_photos()

    photo_directory = get_photo_directory()
    filename = f"{token}.jpg"

    if not (photo_directory / filename).is_file():
        abort(
            404,
            description="사진 다운로드 시간이 만료되었습니다.",
        )

    return send_from_directory(
        photo_directory,
        filename,
        mimetype="image/jpeg",
        as_attachment=False,
        max_age=0,
    )


# =========================================================
# Typecast TTS API
#
# POST /greenhouse/api/tts
# =========================================================

@greenhouse_bp.route("/api/tts", methods=["POST"])
def tts_api():
    try:
        data = request.get_json(silent=True) or {}

        text = str(data.get("text", "")).strip()

        if not text:
            return jsonify({
                "success": False,
                "message": "음성으로 변환할 내용이 없습니다.",
            }), 400

        # 지나치게 긴 요청 방지
        if len(text) > 5000:
            return jsonify({
                "success": False,
                "message": "음성 변환 내용이 너무 깁니다.",
            }), 413

        api_key = get_typecast_api_key()

        if not api_key or not VOICE_ID:
            current_app.logger.error(
                "[TTS] Typecast API 키 또는 Voice ID가 설정되지 않았습니다."
            )

            return jsonify({
                "success": False,
                "message": "Typecast 설정이 없습니다.",
            }), 500

        current_app.logger.info(
            "[TTS] Typecast 음성 생성 요청: 글자 수=%s",
            len(text),
        )

        response = requests.post(
            "https://api.typecast.ai/v1/text-to-speech",

            headers=TYPECAST_HEADERS,

            json={
                "voice_id": VOICE_ID,
                "text": text,
                "model": "ssfm-v30",
                "language": "kor",
                "output": {
                    "audio_format": "mp3",
                },
            },

            timeout=60,
        )

        if not response.ok:
            current_app.logger.error(
                "[TTS] Typecast 오류: status=%s, body=%s",
                response.status_code,
                response.text[:500],
            )

            return jsonify({
                "success": False,
                "message": "Typecast 음성 생성에 실패했습니다.",
            }), 502

        if not response.content:
            return jsonify({
                "success": False,
                "message": "생성된 음성 데이터가 없습니다.",
            }), 502

        current_app.logger.info(
            "[TTS] 음성 생성 완료: %s bytes",
            len(response.content),
        )

        # MP3 바이너리를 브라우저에 바로 전달
        return Response(
            response.content,
            status=200,
            mimetype="audio/mpeg",
            headers={
                "Cache-Control": "no-store",
            },
        )

    except requests.Timeout:
        current_app.logger.exception(
            "[TTS] Typecast 요청 시간 초과"
        )

        return jsonify({
            "success": False,
            "message": "음성 생성 시간이 초과되었습니다.",
        }), 504

    except requests.RequestException:
        current_app.logger.exception(
            "[TTS] Typecast 요청 오류"
        )

        return jsonify({
            "success": False,
            "message": "Typecast 서버 요청 중 오류가 발생했습니다.",
        }), 502

    except Exception:
        current_app.logger.exception(
            "[TTS] 음성 생성 처리 중 오류"
        )

        return jsonify({
            "success": False,
            "message": "음성 생성 중 오류가 발생했습니다.",
        }), 500


