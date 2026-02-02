// lib/rag-chain.ts

// ════════════════════════════════════════════
// RAG 체인 — 검색 + 장소별 날씨 + AI 답변
// ════════════════════════════════════════════

import { searchPlaces } from "./vectorStore";
import { getGeminiModel } from "./gemini";
import {
  getWeatherForPlaces,
  getWeatherRecommendation,
  PlaceWeather,
} from "./weather";

// ─── 응답 타입 ───

export interface ChatResponse {
  answer: string; // AI가 생성한 답변
  places: PlaceWithWeather[]; // 검색된 장소 + 날씨
}

export interface PlaceWithWeather {
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  weather?: {
    temperature: number;
    description: string;
    recommendation: string;
  };
  regionLabel?: string;
}

// ─── 메인 함수 ───

/**
 * 사용자 질문을 받아서 AI 답변을 생성합니다.
 *
 * 처리 흐름:
 *   1. 질문과 비슷한 장소 5개를 벡터 검색
 *   2. 검색된 장소들의 위도/경도로 날씨 조회
 *   3. 장소 정보 + 날씨 정보를 프롬프트에 조립
 *   4. Gemini AI가 최종 답변 생성
 */
export async function chat(userQuestion: string): Promise<ChatResponse> {
  // ══════════════════════════════════════
  //  1단계: 벡터 검색 — 질문과 비슷한 장소 찾기
  // ══════════════════════════════════════

  const searchResults = await searchPlaces(userQuestion, 5);
  // → 질문과 의미가 비슷한 장소 5개를 돌려줌
  // → 각 결과에는 pageContent(텍스트)와 metadata(원본 정보)가 있음

  // ══════════════════════════════════════
  //  2단계: 검색된 장소들의 날씨 조회
  // ══════════════════════════════════════

  // 검색 결과에서 장소 정보를 꺼냄
  const placesForWeather = searchResults.map((doc) => ({
    name: doc.metadata.name as string,
    latitude: doc.metadata.latitude as number,
    longitude: doc.metadata.longitude as number,
    address: doc.metadata.address as string,
  }));

  // 각 장소의 좌표로 날씨 조회 (가까운 장소끼리 자동 그룹화)
  const placeWeathers: PlaceWeather[] =
    await getWeatherForPlaces(placesForWeather);

  // 빠른 조회를 위한 Map 생성 (장소이름 → 날씨)
  const weatherMap = new Map<string, PlaceWeather>();
  for (const pw of placeWeathers) {
    weatherMap.set(pw.placeName, pw);
  }

  // ══════════════════════════════════════
  //  3단계: 프롬프트 조립
  // ══════════════════════════════════════

  // 각 장소의 정보 + 해당 위치 날씨를 텍스트로 정리
  const placesContext = searchResults
    .map((doc, i) => {
      const pw = weatherMap.get(doc.metadata.name as string);

      // 장소 기본 정보
      let text = `[장소 ${i + 1}]\n${doc.pageContent}`;

      // 해당 장소의 날씨 정보 추가
      if (pw) {
        const rec = getWeatherRecommendation(pw.weather);
        text += `\n현재 날씨 (${pw.regionLabel} 지역): `;
        text += `${pw.weather.temperature}°C, ${pw.weather.description}`;
        text += ` (체감 ${pw.weather.feelsLike}°C)`;
        text += `\n습도: ${pw.weather.humidity}%, 풍속: ${pw.weather.windSpeed}m/s`;
        text += `\n날씨 추천: ${rec}`;
      }

      return text;
    })
    .join("\n\n");

  // AI에게 보낼 최종 프롬프트
  const prompt = `
당신은 제주도 여행 전문 가이드 AI입니다.
아래 제공된 [관련 여행지 정보]만을 바탕으로 사용자의 질문에 답변하세요.

## 관련 여행지 정보 (각 장소별 현재 날씨 포함)
${placesContext}

## 작성 규칙
1. 질문과 관련된 장소를 위 목록에서 찾아 구체적으로 설명하세요.
2. 목록에 없는 장소나 정보는 절대 지어내지 마세요. 찾는 정보가 없으면 솔직히 말하세요.
3. 현재 날씨(기온, 날씨 상태)를 고려하여 방문하기 좋은지 조언하세요. (예: 비오면 실내 추천)
4. 답변은 친절하게 하되, 100자 이내로 요약하여 문장이 끊기지 않게 하세요.

## 사용자 질문
${userQuestion}
  `.trim();

  // ══════════════════════════════════════
  //  4단계: Gemini AI로 답변 생성
  // ══════════════════════════════════════

  const model = getGeminiModel();
  const response = await model.invoke(prompt);

  // ══════════════════════════════════════
  //  5단계: 결과 정리
  // ══════════════════════════════════════

  const places: PlaceWithWeather[] = searchResults.map((doc) => {
    const pw = weatherMap.get(doc.metadata.name as string);

    return {
      name: doc.metadata.name,
      address: doc.metadata.address,
      category: doc.metadata.category,
      latitude: doc.metadata.latitude,
      longitude: doc.metadata.longitude,
      weather: pw
        ? {
            temperature: pw.weather.temperature,
            description: pw.weather.description,
            recommendation: getWeatherRecommendation(pw.weather),
          }
        : undefined,
      regionLabel: pw?.regionLabel,
    };
  });

  return {
    answer: response.content as string,
    places,
  };
}
