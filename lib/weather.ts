// lib/weather.ts

// ════════════════════════════════════════════
// 날씨 조회 모듈 (장소별 위도/경도 기반)
// ════════════════════════════════════════════

// ─── 타입 정의 ───

/** 날씨 데이터 구조 */
export interface WeatherData {
  temperature: number; // 현재 기온 (°C)
  feelsLike: number; // 체감 온도
  description: string; // 날씨 설명 (예: "맑음", "흐림")
  humidity: number; // 습도 (%)
  windSpeed: number; // 풍속 (m/s)
  icon: string; // 날씨 아이콘 코드
  isRainy: boolean; // 비 오는 중?
  isCloudy: boolean; // 흐림?
}

/** 장소 + 날씨 결합 데이터 */
export interface PlaceWeather {
  placeName: string; // 장소 이름
  latitude: number; // 위도
  longitude: number; // 경도
  weather: WeatherData; // 해당 위치의 날씨
  regionLabel: string; // 지역 라벨 (예: "성산 지역", "서귀포 지역")
}

// ─── 내부 캐시 ───
//
// 같은 좌표를 반복 조회하지 않기 위한 캐시
// 키: "위도,경도" (소수점 둘째자리까지)
// 값: { data: 날씨데이터, timestamp: 저장시각 }
//
const weatherCache = new Map<
  string,
  { data: WeatherData; timestamp: number }
>();

// 캐시 유효 시간: 10분 (600,000 밀리초)
const CACHE_DURATION = 10 * 60 * 1000;

// ─── 핵심 함수 1: 특정 좌표의 날씨 조회 ───

/**
 * 주어진 위도/경도의 날씨를 조회합니다.
 *
 * @param lat - 위도 (예: 33.4612)
 * @param lon - 경도 (예: 126.9425)
 * @returns 날씨 데이터
 *
 * 특징:
 *   - 10분 이내 같은 좌표 재요청 시 캐시 사용 (API 절약)
 *   - 좌표는 소수점 2자리로 반올림해서 비교
 *     (0.01도 차이 ≈ 약 1km → 같은 날씨권)
 */
export async function getWeatherByCoords(
  lat: number,
  lon: number,
): Promise<WeatherData> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY가 설정되지 않았습니다.");
  }

  // ── 좌표 반올림 (소수점 2자리) ──
  // 33.4612 → 33.46  /  126.9425 → 126.94
  // 아주 가까운 장소들은 같은 키를 갖게 되어 중복 호출 방지
  const roundedLat = Math.round(lat * 100) / 100;
  const roundedLon = Math.round(lon * 100) / 100;
  const cacheKey = `${roundedLat},${roundedLon}`;

  // ── 캐시 확인 ──
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // ── API 호출 ──
  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?lat=${roundedLat}&lon=${roundedLon}` +
    `&appid=${apiKey}` +
    `&units=metric` +
    `&lang=kr`;

  const res = await fetch(url);
  const json = await res.json();

  if (!res.ok) {
    throw new Error(`날씨 API 오류: ${json.message}`);
  }

  const weatherId = json.weather[0]?.id || 0;

  const weatherData: WeatherData = {
    temperature: Math.round(json.main.temp),
    feelsLike: Math.round(json.main.feels_like),
    description: json.weather[0]?.description || "정보 없음",
    humidity: json.main.humidity,
    windSpeed: json.wind.speed,
    icon: json.weather[0]?.icon || "01d",
    isRainy: weatherId >= 200 && weatherId < 600,
    isCloudy: weatherId >= 801,
  };

  // ── 캐시에 저장 ──
  weatherCache.set(cacheKey, {
    data: weatherData,
    timestamp: Date.now(),
  });

  return weatherData;
}

// ─── 핵심 함수 2: 여러 장소의 날씨를 한꺼번에 조회 ───

/**
 * 검색된 장소 목록의 날씨를 일괄 조회합니다.
 *
 * @param places - 장소 배열 (name, latitude, longitude 필수)
 * @returns 장소별 날씨 배열
 *
 * 동작 방식:
 *   1. 각 장소의 좌표를 소수점 2자리로 반올림
 *   2. 같은 좌표끼리 그룹화 (가까운 장소는 한 번만 호출)
 *   3. 그룹별로 날씨 API 호출
 *   4. 결과를 각 장소에 매핑
 *
 * 예시:
 *   성산일출봉 (33.46, 126.94) ─┐
 *   섭지코지   (33.46, 126.93) ─┤→ 같은 지역! API 1회만 호출
 *   협재해변   (33.39, 126.24) ─→ 다른 지역 → API 1회 추가
 *   총 3장소, API 호출 2회
 */
export async function getWeatherForPlaces(
  places: Array<{
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }>,
): Promise<PlaceWeather[]> {
  const results: PlaceWeather[] = [];

  for (const place of places) {
    // 좌표가 없는 장소는 건너뛰기
    if (!place.latitude || !place.longitude) {
      continue;
    }

    try {
      const weather = await getWeatherByCoords(place.latitude, place.longitude);

      // 주소에서 지역명 추출 (예: "서귀포시 성산읍..." → "성산")
      const regionLabel = extractRegionName(place.address || "", place.name);

      results.push({
        placeName: place.name,
        latitude: place.latitude,
        longitude: place.longitude,
        weather,
        regionLabel,
      });
    } catch (error) {
      // 한 장소의 날씨 조회 실패 시 → 나머지는 계속 진행
      console.warn(`⚠️ ${place.name} 날씨 조회 실패:`, error);
    }
  }

  return results;
}

// ─── 핵심 함수 3: 날씨 기반 추천 메시지 ───

/**
 * 날씨 데이터를 보고 추천 메시지를 생성합니다.
 */
export function getWeatherRecommendation(weather: WeatherData): string {
  if (weather.isRainy) {
    return "비가 오고 있어 실내 관광지, 박물관, 카페를 추천합니다.";
  }
  if (weather.temperature >= 30) {
    return "매우 더워서 해변, 동굴, 실내 시설을 추천합니다.";
  }
  if (weather.temperature <= 5) {
    return "매우 추워서 따뜻한 실내 관광지, 온천, 카페를 추천합니다.";
  }
  if (weather.isCloudy) {
    return "흐린 날씨라 실내외 모두 좋고, 오름이나 해안도로도 괜찮습니다.";
  }
  return "맑은 날씨라 야외 활동, 해변, 오름 트레킹을 추천합니다.";
}

// ─── 보조 함수: 주소에서 지역명 추출 ───

/**
 * 주소 문자열에서 읍/면/동 단위의 지역명을 추출합니다.
 *
 * 예시:
 *   "서귀포시 성산읍 일출로 284-12" → "성산"
 *   "제주시 한림읍 협재리"          → "한림"
 *   "제주시 연동 7길"               → "연동"
 *   주소가 없으면 장소 이름을 반환
 */
function extractRegionName(address: string, fallback: string): string {
  // "~읍", "~면", "~동" 패턴 찾기
  const match = address.match(/(?:제주시|서귀포시)\s+(\S+?(?:읍|면|동))/);

  if (match) {
    // "성산읍" → "성산"
    return match[1].replace(/[읍면동]$/, "");
  }

  // 시 단위로라도 추출
  if (address.includes("서귀포")) return "서귀포";
  if (address.includes("제주시")) return "제주시";

  // 아무것도 못 찾으면 장소 이름 사용
  return fallback;
}

// ─── 보조 함수: 헤더용 대표 날씨 (UI 위젯에 표시) ───

/**
 * 제주 중심부의 날씨를 조회합니다.
 * 화면 상단 날씨 위젯에 표시할 용도입니다.
 */
export async function getJejuWeather(): Promise<WeatherData> {
  // 제주 시청 좌표 (대표값)
  return getWeatherByCoords(33.4996, 126.5312);
}
