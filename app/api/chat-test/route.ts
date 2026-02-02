// app/api/chat-test/route.ts

import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/rag-chain";

export async function GET(req: NextRequest) {
  const question =
    req.nextUrl.searchParams.get("q") ||
    "오늘 날씨에 맞는 제주 관광지 추천해줘";

  try {
    const result = await chat(question);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
