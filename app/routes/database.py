from flask import url_for
from supabase import create_client, Client # type: ignore

SUPABASE_URL = "https://pfaumbqgpyvpbcqdamif.supabase.co"
SUPABASE_KEY = "sb_publishable_8t22Svsv6Zp8oP2dqsOUOw_3iXGkPUh"

# 1. 클라이언트 생성
supabase_client: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 데이터베이스 타입(DB의 type 컬럼 값)을 HTML 아이콘 키와 매핑
TYPE_TO_KEY = {
    '화장실': 'toilet',
    '카페': 'cafe',
    '편의점': 'convenience',
    '의무실': 'infirmary',
    '수유실': 'nursing',
    '교육체험공간': 'education',

    # 출입구
    '출입구': 'entrance',
    '주출입구': 'entrance',
    '부출입구': 'sub_entrance',
    '특별전시실 출입구': 'special_entrance',
    '지중해온실 상단 출입구': 'mediterranean_top',
    '지중해온실 하단 출입구': 'mediterranean_bottom',
    '열대온실 상단 출입구': 'tropical_top',
    '열대온실 하단 출입구': 'tropical_bottom',
}

def get_facilities_from_db(supabase_client):
    """Supabase에서 arboretum_facilities 데이터를 조회하여 가공한다."""
    try:
        response = supabase_client.table('arboretum_facilities').select('*').order('id', desc=False).execute()
        db_facilities = response.data or []
        
        # 🟢 DB 데이터 조회 성공 여부와 개수를 콘솔에 출력
        print(f"[DB] 시설 데이터 조회 성공: {len(db_facilities)}개 항목")
        
        if not db_facilities:
            print("[DB] 경고: 테이블에 데이터가 없습니다.")
            return []

        facilities_list = []
        for fac in db_facilities:
            fac_type = fac.get('type')
            facilities_list.append({
                'id': fac.get('id'),
                'key': TYPE_TO_KEY.get(fac_type, 'entrance'),
                'name': fac.get('name'), # HTML에서 item.name과 맞춤
                'location_description': fac.get('location_description', ''),
                'coord_x': float(fac.get('coord_x')) if fac.get('coord_x') else 0,
                'coord_y': float(fac.get('coord_y')) if fac.get('coord_y') else 0,
                'is_open': fac.get('is_open', True)
            })
        return facilities_list
        
    except Exception as error:
        # 🔴 상세 에러 내용을 콘솔에 출력하여 원인 파악
        print("[DB] 시설 정보 조회 오류 발생:", repr(error))
        return []

# 테스트 호출 (서버 실행 시 터미널에 로그가 찍힙니다)
# facilities = get_facilities_from_db(supabase_client)
# print(facilities)


def save_survey_response(satisfaction, easy_to_understand, reuse):
    """만족도 설문 답변을 Supabase에 저장한다."""

    # 1. 질문 1: 만족도 점수 검증
    if (
        isinstance(satisfaction, bool)
        or not isinstance(satisfaction, int)
        or satisfaction not in range(1, 6)
    ):
        raise ValueError("만족도는 1~5점 중 하나여야 합니다.")

    # 2. 질문 2: 이해도 답변 검증
    if easy_to_understand not in ("yes", "normal", "no"):
        raise ValueError("이해도 응답이 올바르지 않습니다.")

    # 3. 질문 3: 재이용 의향 검증
    if reuse not in ("yes", "no"):
        raise ValueError("재이용 응답이 올바르지 않습니다.")
    
    print("[SURVEY] satisfaction:", repr(satisfaction), type(satisfaction))
    print("[SURVEY] easy_to_understand:", repr(easy_to_understand))
    print("[SURVEY] reuse:", repr(reuse))

    # 4. Supabase에 저장
    response = (
        supabase_client
        .table("survey_responses")
        .insert({
            "satisfaction": satisfaction,
            "easy_to_understand": easy_to_understand,
            "reuse": reuse
            },
            returning="minimal",
        )
        .execute()
    )

    print("[DB] 만족도 설문 저장 성공")
    return True
