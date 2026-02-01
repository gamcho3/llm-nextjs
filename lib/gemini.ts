// lib/gemini.ts

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  HumanMessage,
  SystemMessage,
  AIMessage,
} from "@langchain/core/messages";
import { ChatMessage } from "@/types";

// Gemini 채팅 모델 생성
function getChatModel() {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY!,
    modelName: "gemini-1.5-flash", // 빠르고 효율적인 모델
    temperature: 0.7, // 창의성 수준 (0: 정확함, 1: 창의적)
    maxOutputTokens: 1024, // 최대 응답 길이
  });
}

// 시스템 프롬프트 (AI의 역할 정의)
const SYSTEM_PROMPT = `당신은 친절하고 전문적인 제주도 여행 가이드 AI입니다.

## 역할
- 제주도 여행지, 맛집, 카페, 액티비티를 추천합니다.
- 현재 날씨를 고려하여 적절한 장소를 추천합니다.
- 사용자의 상황(동행자, 목적, 시간 등)에 맞는 맞춤 추천을 제공합니다.

## 응답 스타일
- 친근하고 따뜻한 말투를 사용합니다.
- 이모지를 적절히 활용합니다.
- 장소 추천 시 간단한 설명과 특징을 함께 알려줍니다.
- 각 장소의 지역 날씨 정보가 있으면 함께 안내합니다.
- 주소나 연락처가 있으면 함께 안내합니다.

## 주의사항
- 제공된 정보를 기반으로만 답변합니다.
- 확실하지 않은 정보는 언급하지 않습니다.
- 날씨가 좋지 않으면 실내 장소를 우선 추천합니다.
- 지역별 날씨 차이가 있을 수 있음을 안내합니다.
`;

// 컨텍스트 포함 프롬프트 생성
export function buildPromptWithContext(
  userQuery: string,
  weatherInfo: string,
  placesContext: string,
): string {
  return `
## 현재 날씨 정보
${weatherInfo}

## 검색된 제주 여행지 정보 (지역별 날씨 포함)
${placesContext}

## 사용자 질문
${userQuery}

위 정보를 바탕으로 사용자의 질문에 친절하게 답변해주세요.
검색된 여행지 중에서 날씨와 사용자 상황에 맞는 곳을 추천해주세요.
각 장소의 지역 날씨도 참고하여 안내해주세요.
`;
}

// AI 응답 생성
export async function generateResponse(
  userQuery: string,
  weatherInfo: string,
  placesContext: string,
  chatHistory: ChatMessage[] = [],
): Promise<string> {
  const model = getChatModel();

  // 메시지 배열 구성
  const messages = [new SystemMessage(SYSTEM_PROMPT)];

  // 이전 대화 내역 추가 (최근 10개만)
  const recentHistory = chatHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else {
      messages.push(new AIMessage(msg.content));
    }
  }

  // 현재 사용자 질문 (컨텍스트 포함)
  const promptWithContext = buildPromptWithContext(
    userQuery,
    weatherInfo,
    placesContext,
  );
  messages.push(new HumanMessage(promptWithContext));

  // AI 응답 생성
  const response = await model.invoke(messages);

  return response.content as string;
}

// 간단한 응답 생성 (컨텍스트 없이)
export async function generateSimpleResponse(
  userQuery: string,
): Promise<string> {
  const model = getChatModel();

  const messages = [
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(userQuery),
  ];

  const response = await model.invoke(messages);

  return response.content as string;
}
