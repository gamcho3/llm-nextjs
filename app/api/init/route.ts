// app/api/init/route.ts

import { NextResponse } from "next/server";
import { getVectorStore } from "@/lib/vectorStore";

export async function POST() {
  try {
    const store = await getVectorStore();
    return NextResponse.json({
      success: true,
      message: "벡터 저장소 초기화 완료",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
