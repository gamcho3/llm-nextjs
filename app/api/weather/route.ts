// app/api/weather/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import type { WeatherData } from "@/types";

const JEJU_LAT = 33.4996;
const JEJU_LON = 126.5312;

export async function GET() {
  try {
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API 키 없음" },
        { status: 500 }
      );
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${JEJU_LAT}&lon=${JEJU_LON}&appid=${apiKey}&units=metric&lang=kr`;

    const response = await axios.get(url);
    const data = response.data;

    // 날씨 상태 매핑
    const weatherMain = data.weather[0].main.toLowerCase();
    let condition: WeatherData["condition"] = "clear";

    if (weatherMain.includes("rain")) condition = "rain";
    else if (weatherMain.includes("snow")) condition = "snow";
    else if (weatherMain.includes("cloud")) condition = "cloud";

    const weatherData: WeatherData = {
      temperature: Math.round(data.main.temp),
      condition,
      description: data.weather[0].description,
    };

    return NextResponse.json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error("날씨 API 오류:", error);
    return NextResponse.json(
      { success: false, error: "날씨 조회 실패" },
      { status: 500 }
    );
  }
}
