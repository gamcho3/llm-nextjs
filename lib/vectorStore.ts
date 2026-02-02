// lib/vectorStore.ts

import { HNSWLib } from "@langchain/community/vectorstores/hnswlib";
import { Document } from "@langchain/core/documents";
import { getEmbeddings } from "./embeddings";
import { loadPlaces } from "./csvParser";
import { Place } from "@/types";

// 메모리에 벡터 저장소를 캐시 (서버가 살아있는 동안 유지)
let vectorStore: HNSWLib | null = null;
const VECTOR_STORE_PATH = "data/vector_store_v2";

export async function getVectorStore(): Promise<HNSWLib> {
  if (vectorStore) return vectorStore;

  // 1) 디스크에 저장된 인덱스가 있는지 확인 (API 호출 절약)
  try {
    const fs = await import("fs");
    const path = await import("path");
    const fullPath = path.join(process.cwd(), VECTOR_STORE_PATH);

    if (fs.existsSync(fullPath)) {
      console.log("📂 기존 벡터 저장소 로드 중...");
      vectorStore = await HNSWLib.load(fullPath, getEmbeddings());
      console.log("✅ 벡터 저장소 로드 완료 (API 호출 없음)");
      return vectorStore;
    }
  } catch (error) {
    console.error("⚠️ 벡터 저장소 로드 실패 (새로 생성합니다):", error);
  }

  console.log("🔄 새로운 벡터 저장소 생성 중... (API 호출 발생)");

  // 2) 장소 데이터 로드 (개수 늘림: 5 -> 1000 or 전체)
  //    API Quota를 고려하여 적절히 조절. 저장소가 저장되면 다음부터는 호출 안 함.
  const places: Place[] = loadPlaces().slice(0, 300);

  // 3) 각 장소를 "문서"로 변환
  const docs = places.map(
    (place) =>
      new Document({
        pageContent: [
          `장소명: ${place.name}`,
          `주소: ${place.address}`,
          `도로명주소: ${place.roadAddress || ""}`,
          `위도: ${place.latitude}`,
          `경도: ${place.longitude}`,
          `특징: ${place.roadAddress ? "도로명 주소 보유" : "지번 주소만 보유"}`,
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
      }),
  );

  // 4) 임베딩 생성 & 벡터 저장소 생성
  vectorStore = await HNSWLib.fromDocuments(docs, getEmbeddings());

  // 5) 디스크에 저장 (다음 실행 때 API 아끼기 위함)
  try {
    await vectorStore.save(VECTOR_STORE_PATH);
    console.log(`✅ 벡터 저장소 저장 완료 (${VECTOR_STORE_PATH})`);
  } catch (err) {
    console.error("⚠️ 벡터 저장소 저장 실패:", err);
  }

  console.log(`✅ 벡터 저장소 완성 — 문서 ${docs.length}개`);
  return vectorStore;
}

export async function searchPlaces(query: string, limit: number = 5) {
  const store = await getVectorStore();
  const results = await store.similaritySearch(query, limit);
  return results;
}
