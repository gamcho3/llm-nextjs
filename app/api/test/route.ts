// app/api/test/route.ts

import { NextResponse } from "next/server";
import { loadJejuPlaces } from "@/lib/csv-loader";
import { searchSimilarPlaces } from "@/lib/vector-store";

export async function GET() {
  try {
    // 1. CSV 데이터 로드 테스트
    console.log("📊 CSV 데이터 로드 테스트...");
    const places = await loadJejuPlaces();

    // 2. 벡터 검색 테스트
    console.log("🔍 벡터 검색 테스트...");
    const searchResults = await searchSimilarPlaces("바다 카페", 2);

    // 3. 결과 반환
    return NextResponse.json({
      success: true,
      message: "데이터 로드 성공!",
      totalPlaces: places.length,
      samplePlaces: places.slice(0, 3).map((p) => ({
        name: p.name,
        address: p.address,
      })),
      searchResults: searchResults.map((doc) => ({
        name: doc.metadata.name,
        content: doc.pageContent.substring(0, 200) + "...",
      })),
    });
  } catch (error) {
    console.error("❌ 에러 발생:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 에러",
      },
      { status: 500 },
    );
  }
}
