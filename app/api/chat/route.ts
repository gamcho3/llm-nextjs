// app/api/chat/route.ts

import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/rag-chain";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "메시지를 입력해주세요." },
        { status: 400 },
      );
    }

    const result = await chat(message);

    console.log(result);

    return NextResponse.json({
      success: true,
      answer: result.answer,
      places: result.places,
      // places 안에 각 장소의 weather 정보가 포함되어 있음
      // 예: places[0].weather = { temperature: 6, description: "흐림", ... }
    });
  } catch (error: any) {
    console.error("채팅 오류:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
