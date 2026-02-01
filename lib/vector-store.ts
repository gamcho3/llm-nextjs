// lib/vector-store.ts

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { JejuPlace } from "@/types";
import { loadJejuPlaces, placeToText } from "./csv-loader";
import { WeatherCondition } from "@/types";
// 전역 변수로 벡터 저장소 캐싱 (서버 재시작 전까지 유지)
let vectorStore: MemoryVectorStore | null = null;
let placesData: JejuPlace[] = [];

// Gemini 임베딩 모델 생성
// 텍스트를 벡터(숫자)로 변환
function getEmbeddings() {
  return new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY!,
    modelName: "text-embedding-004", // Gemini 임베딩 모델
  });
}

// 벡터 저장소 초기화 (최초 1회만 실행)
export async function initializeVectorStore(): Promise<MemoryVectorStore> {
  // 이미 초기화되어 있으면 기존 것 반환
  if (vectorStore) {
    console.log("✅ 기존 벡터 저장소 사용");
    return vectorStore;
  }

  console.log("🔄 벡터 저장소 초기화 시작...");

  // 1. CSV 데이터 로드
  placesData = await loadJejuPlaces();
  console.log(`📊 ${placesData.length}개 장소 데이터 로드 완료`);

  // 2. Document 객체로 변환
  // (대용량 데이터이므로 처음 1000개만 사용 - 테스트용)
  const sampleData = placesData.slice(0, 1000);

  const documents = sampleData.map((place, index) => {
    return new Document({
      pageContent: placeToText(place),
      metadata: {
        id: place.contentsId,
        name: place.name,
        address: place.address,
        latitude: place.latitude,
        longitude: place.longitude,
        index: index,
      },
    });
  });

  console.log(`📄 ${documents.length}개 문서 생성 완료`);

  // 3. 벡터 저장소 생성
  const embeddings = getEmbeddings();
  vectorStore = await MemoryVectorStore.fromDocuments(documents, embeddings);

  console.log("✅ 벡터 저장소 초기화 완료!");

  return vectorStore;
}

// 유사한 장소 검색
export async function searchSimilarPlaces(
  query: string,
  topK: number = 5,
): Promise<Document[]> {
  const store = await initializeVectorStore();

  // 유사도 검색 수행
  const results = await store.similaritySearch(query, topK);

  return results;
}

// 전체 장소 데이터 가져오기
export function getAllPlaces(): JejuPlace[] {
  return placesData;
}

// ✅ 새로 추가: 날씨 기반 장소 검색
export async function searchPlacesByWeather(
  userQuery: string,
  weatherCondition: WeatherCondition,
  topK: number = 5,
): Promise<Document[]> {
  // 사용자 질문 + 날씨 기반 키워드 결합
  const weatherKeywords = weatherCondition.searchKeywords.join(" ");
  const combinedQuery = `${userQuery} ${weatherKeywords}`;

  console.log(`🔍 검색 쿼리: ${combinedQuery}`);

  const store = await initializeVectorStore();
  const results = await store.similaritySearch(combinedQuery, topK);

  return results;
}
