// types/index.ts

export interface Place {
  name: string; // 장소명
  address: string; // 주소
  roadAddress?: string; // 도로명주소
  latitude: number; // 위도
  longitude: number; // 경도
  createdAt?: string; // 생성일
  updatedAt?: string; // 수정일
}

export type WeatherCondition = "sunny" | "rainy" | "cloudy" | "snowy" | string;

export interface WeatherAnalysis {
  isRainy: boolean;
  isHot: boolean;
  isCold: boolean;
  isWindy: boolean;
  recommendationType: "indoor" | "outdoor" | "both";
  searchKeywords: string[];
}

export interface WeatherData {
  condition: "clear" | "rain" | "snow" | "clouds" | string;
  temperature: number;
  description: string;
}

export interface WeatherInfo {
  condition?: WeatherCondition;
  temperature: number;
  feelsLike: number;
  description: string;
  descriptionKorean: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  main: string;
}
