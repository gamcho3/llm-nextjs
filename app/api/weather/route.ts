// app/api/weather/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getJejuWeather, getWeatherByCoords } from "@/lib/weather";

/**
 * GET /api/weather
 *
 * 사용법:
 *   /api/weather              → 제주 중심부 날씨 (헤더 위젯용)
 *   /api/weather?lat=33.46&lon=126.94  → 특정 좌표 날씨
 */
export async function GET(req: NextRequest) {
  try {
    const lat = req.nextUrl.searchParams.get("lat");
    const lon = req.nextUrl.searchParams.get("lon");

    let weather;

    if (lat && lon) {
      // 특정 좌표가 지정된 경우
      weather = await getWeatherByCoords(parseFloat(lat), parseFloat(lon));
    } else {
      // 좌표 없으면 제주 중심부 날씨
      weather = await getJejuWeather();
    }

    return NextResponse.json({ success: true, weather });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
