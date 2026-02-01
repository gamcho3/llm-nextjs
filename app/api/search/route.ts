// app/api/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/vectorStore";
import { processCSVToDocuments, filterByWeather } from "@/lib/csvParser";
import type { WeatherCondition } from "@/types";

interface SearchRequest {
  query: string;
  weather?: WeatherCondition;
  limit?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { query, weather, limit = 5 }: SearchRequest = await request.json();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "검색어 필요" },
        { status: 400 }
      );
    }

    // 벡터 검색
    let results = await searchPlaces(query, limit * 2);

    // 날씨 필터링
    if (weather) {
      const allDocs = processCSVToDocuments();
      const filtered = filterByWeather(allDocs, weather);
      const filteredIds = new Set(filtered.map((d) => d.metadata.id));

      results = results.filter((r) => filteredIds.has(r.metadata.id as string));
    }

    const formattedResults = results.slice(0, limit).map((doc) => ({
      id: doc.metadata.id,
      name: doc.metadata.name,
      address: doc.metadata.address,
      latitude: doc.metadata.latitude,
      longitude: doc.metadata.longitude,
    }));

    return NextResponse.json({
      success: true,
      count: formattedResults.length,
      results: formattedResults,
    });
  } catch (error) {
    console.error("검색 오류:", error);
    return NextResponse.json(
      { success: false, error: "검색 실패" },
      { status: 500 }
    );
  }
}
