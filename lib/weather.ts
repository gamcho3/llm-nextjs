// lib/weather.ts

import { WeatherInfo, WeatherCondition } from "@/types";

// 제주도 좌표 (제주시청 기준)
const JEJU_COORDINATES = {
  lat: 33.4996,
  lon: 126.5312,
};

// 영어 날씨 설명 → 한글 변환
const weatherDescriptionMap: Record<string, string> = {
  "clear sky": "맑음",
  "few clouds": "구름 조금",
  "scattered clouds": "구름 낀",
  "broken clouds": "구름 많음",
  "overcast clouds": "흐림",
  "shower rain": "소나기",
  rain: "비",
  "light rain": "가벼운 비",
  "moderate rain": "비",
  "heavy intensity rain": "폭우",
  thunderstorm: "천둥번개",
  snow: "눈",
  mist: "안개",
  fog: "짙은 안개",
  haze: "연무",
};

// 날씨 메인 상태 → 한글 변환
const weatherMainMap: Record<string, string> = {
  Clear: "맑음",
  Clouds: "흐림",
  Rain: "비",
  Drizzle: "이슬비",
  Thunderstorm: "천둥번개",
  Snow: "눈",
  Mist: "안개",
  Fog: "안개",
  Haze: "연무",
};

// OpenWeatherMap API에서 날씨 정보 가져오기
export async function getJejuWeather(
  lat: string,
  lon: string,
): Promise<WeatherInfo> {
  const apiKey = process.env.OPENWEATHER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENWEATHER_API_KEY가 설정되지 않았습니다.");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=kr`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`날씨 API 호출 실패: ${response.status}`);
  }

  const data = await response.json();

  // API 응답에서 필요한 정보 추출
  const weatherInfo: WeatherInfo = {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    descriptionKorean:
      weatherDescriptionMap[data.weather[0].description] ||
      weatherMainMap[data.weather[0].main] ||
      data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    icon: data.weather[0].icon,
    main: data.weather[0].main,
  };

  return weatherInfo;
}

// 날씨 정보를 분석해서 추천 조건 생성
export function analyzeWeatherCondition(
  weather: WeatherInfo,
): WeatherCondition {
  const isRainy = ["Rain", "Drizzle", "Thunderstorm"].includes(weather.main);
  const isSnowy = weather.main === "Snow";
  const isHot = weather.temperature >= 28;
  const isCold = weather.temperature <= 10;
  const isWindy = weather.windSpeed >= 8; // 8m/s 이상이면 강풍
  const isFoggy = ["Mist", "Fog", "Haze"].includes(weather.main);

  // 추천 유형 결정
  let recommendationType: "indoor" | "outdoor" | "both" = "both";

  if (isRainy || isSnowy || isWindy || isFoggy) {
    recommendationType = "indoor";
  } else if (weather.main === "Clear" && !isHot && !isCold) {
    recommendationType = "outdoor";
  }

  // 검색 키워드 생성
  const searchKeywords: string[] = [];

  if (isRainy) {
    searchKeywords.push(
      "실내",
      "박물관",
      "미술관",
      "카페",
      "아쿠아리움",
      "쇼핑",
    );
  } else if (isHot) {
    searchKeywords.push("계곡", "동굴", "실내", "에어컨", "바다", "수영장");
  } else if (isCold) {
    searchKeywords.push("실내", "온천", "카페", "박물관", "찜질방");
  } else if (isWindy) {
    searchKeywords.push("실내", "숲", "계곡", "동굴");
  } else {
    // 날씨 좋을 때
    searchKeywords.push("해변", "오름", "공원", "올레길", "드라이브", "일출");
  }

  return {
    isRainy,
    isHot,
    isCold,
    isWindy,
    recommendationType,
    searchKeywords,
  };
}

// 날씨 정보를 자연어 문장으로 변환
export function weatherToText(weather: WeatherInfo): string {
  const condition = analyzeWeatherCondition(weather);

  let text = `현재 제주도 날씨는 ${weather.descriptionKorean}이며, `;
  text += `기온은 ${weather.temperature}도(체감 ${weather.feelsLike}도)입니다. `;
  text += `습도는 ${weather.humidity}%이고, 풍속은 ${weather.windSpeed}m/s입니다.`;

  // 추천 메시지 추가
  if (condition.isRainy) {
    text += " 비가 오고 있어서 실내 관광지를 추천드립니다.";
  } else if (condition.isHot) {
    text += " 더운 날씨이므로 시원한 장소를 추천드립니다.";
  } else if (condition.isCold) {
    text += " 쌀쌀한 날씨이므로 따뜻한 실내 장소를 추천드립니다.";
  } else if (condition.isWindy) {
    text += " 바람이 강하므로 바람을 피할 수 있는 장소를 추천드립니다.";
  } else {
    text += " 야외 활동하기 좋은 날씨입니다.";
  }

  return text;
}

// 날씨 아이콘 URL 생성
export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}
