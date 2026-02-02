// lib/vectorStore.ts

import { Document } from "@langchain/core/documents";
import { getEmbeddings } from "./embeddings";
import { loadPlaces } from "./csvParser";
import { Place } from "@/types";

// 간단한 인메모리 벡터 저장소
interface VectorStore {
  docs: Document[];
  embeddings: number[][];
}

let vectorStore: VectorStore | null = null;

// 코사인 유사도 계산
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function getVectorStore(): Promise<VectorStore> {
  if (vectorStore) return vectorStore;

  console.log("🔄 새로운 벡터 저장소 생성 중...");

  // 장소 데이터 로드
  const places: Place[] = loadPlaces().slice(0, 500);

  // 각 장소를 "문서"로 변환
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

  // 임베딩 생성
  const embedder = getEmbeddings();
  const texts = docs.map((doc) => doc.pageContent);
  const embeddings = await embedder.embedDocuments(texts);

  vectorStore = { docs, embeddings };

  console.log(`✅ 벡터 저장소 완성 — 문서 ${docs.length}개`);
  return vectorStore;
}

export async function searchPlaces(query: string, limit: number = 5) {
  const store = await getVectorStore();

  // 쿼리 임베딩 생성
  const embedder = getEmbeddings();
  const queryEmbedding = await embedder.embedQuery(query);

  // 모든 문서와의 유사도 계산
  const similarities = store.embeddings.map((embedding, index) => ({
    doc: store.docs[index],
    score: cosineSimilarity(queryEmbedding, embedding),
  }));

  // 유사도 순으로 정렬하고 상위 결과 반환
  similarities.sort((a, b) => b.score - a.score);

  return similarities.slice(0, limit).map((item) => item.doc);
}
