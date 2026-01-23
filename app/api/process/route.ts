// 라우트 : 주소와 기능을 연결하는 규칙
//페이지 라우트: 화면을 돌려줌(HTML/React)
//API 라우트: 데이터를 돌려줌(JSON)


import { NextRequest, NextResponse } from 'next/server';
import {GoogleGenerativeAI} from '@google/generative-ai'

type AssistantRequest = {
  input: string; // 사용자가 입력한 자연어
};

// App Router에서는 route.ts 안에 메서드 이름 그대로 함수를 export 한다
export async function POST(req: NextRequest) {
  try {
    // 부분타입으로 안전하게 받기
    const body = await req.json() as Partial<AssistantRequest>;
      const input = body.input?.trim();

    // Validate that a prompt is provided
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      );
    }   
    
    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    // API 키가 없으면 에러 반환
    if (!apiKey) {
  return NextResponse.json(
    { ok: false, error: "서버에 GEMINI_API_KEY가 설정되지 않았습니다." },
    { status: 500 }
  );
}

    console.log('Received prompt:', input);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });


    // Placeholder response until Gemini is connected
    return NextResponse.json({
      success: true,
      message: 'Prompt received. Processing logic to be implemented.',
      data: {
        originalPrompt: prompt,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
