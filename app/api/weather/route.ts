// app/api/test-weather/route.ts

import { NextResponse } from "next/server";
import {
  getJejuWeather,
  analyzeWeatherCondition,
  weatherToText,
} from "@/lib/weather";
import { searchPlacesByWeather } from "@/lib/vector-store";

export async function GET() {
  try {
    // 1. 날씨 정보 가져오기
    console.log("🌤️ 날씨 정보 가져오는 중...");
    const weather = await getJejuWeather();

    // 2. 날씨 조건 분석
    const condition = analyzeWeatherCondition(weather);

    // 3. 날씨 기반 장소 검색
    console.log("🔍 날씨 기반 장소 검색 중...");
    const places = await searchPlacesByWeather(
      "제주 여행 추천", // 기본 검색어
      condition,
      5, // 상위 5개
    );

    // 4. 결과 반환
    return NextResponse.json({
      success: true,
      weather: {
        temperature: weather.temperature,
        description: weather.descriptionKorean,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
      },
      condition: {
        recommendationType: condition.recommendationType,
        searchKeywords: condition.searchKeywords,
      },
      weatherDescription: weatherToText(weather),
      recommendedPlaces: places.map((doc) => ({
        name: doc.metadata.name,
        category: doc.metadata.category,
        address: doc.metadata.address,
        preview: doc.pageContent.substring(0, 150) + "...",
      })),
    });
  } catch (error) {
    console.error("❌ 에러:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      },
      { status: 500 },
    );
  }
}
