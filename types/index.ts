export interface JejuPlace {
  contentsId: string; // 콘텐츠ID
  name: string; // 콘텐츠명 (장소 이름)
  address: string; // 주소
  roadAddress: string; // 도로명주소
  createdAt: string; // 등록일시
  updatedAt: string; // 수정일시
  latitude: number; // 위도
  longitude: number; // 경도
}

// 채팅 메시지 타입
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ✅ 날씨 정보 타입 (수정/추가)
export interface WeatherInfo {
  temperature: number; // 기온 (섭씨)
  feelsLike: number; // 체감 온도
  description: string; // 날씨 설명 (맑음, 흐림 등)
  descriptionKorean: string; // 한글 날씨 설명
  humidity: number; // 습도 (%)
  windSpeed: number; // 풍속 (m/s)
  icon: string; // 날씨 아이콘 코드
  main: string; // 날씨 메인 상태 (Rain, Clear 등)
}

// ✅ 날씨 기반 추천 조건 타입
export interface WeatherCondition {
  isRainy: boolean; // 비 오는지
  isHot: boolean; // 더운지 (28도 이상)
  isCold: boolean; // 추운지 (10도 이하)
  isWindy: boolean; // 바람 강한지
  recommendationType: "indoor" | "outdoor" | "both"; // 추천 유형
  searchKeywords: string[]; // 검색에 사용할 키워드
}
