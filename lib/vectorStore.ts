// lib/vectorStore.ts

import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { Document } from "@langchain/core/documents";
import { getEmbeddings } from "./embeddings";
import { loadPlaces } from "./csvParser";
import { Place } from "@/types";

// 메모리에 벡터 저장소를 캐시 (서버가 살아있는 동안 유지)
let vectorStore: HNSWLib | null = null;

export async function getVectorStore(): Promise<HNSWLib> {
  if (vectorStore) return vectorStore;

  console.log("🔄 벡터 저장소 초기화 중...");

  // 1) 장소 데이터 로드
  const places: Place[] = loadPlaces();

  // 2) 각 장소를 "문서"로 변환
  //    pageContent = AI가 검색할 텍스트
  //    metadata    = 원본 정보 (나중에 결과 표시용)
  const docs = places.map(
    (place) =>
      new Document({
        pageContent: [
          `장소명: ${place.name}`,
          `주소: ${place.address}`,
          `도로명주소: ${place.roadAddress || ""}`,
          `위도: ${place.latitude}`,
          `경도: ${place.longitude}`,
        ].join("\n"),
        metadata: {
          name: place.name,
          address: place.address,
          roadAddress: place.roadAddress,
          latitude: place.latitude,
          longitude: place.longitude,
          createdAt: place.createdAt,
          updatedAt: place.updatedAt,
        },
      })
  );

  // 3) 임베딩 생성 & 벡터 저장소에 저장
  vectorStore = await HNSWLib.fromDocuments(docs, getEmbeddings());

  console.log(`✅ 벡터 저장소 완성 — 문서 ${docs.length}개`);
  return vectorStore;
}

export async function searchPlaces(query: string, limit: number = 5) {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, limit);
  return results;
}
