// lib/embeddings.ts

import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Gemini 임베딩 모델 인스턴스 (싱글톤)
let embeddings: GoogleGenerativeAIEmbeddings | null = null;

export function getEmbeddings(): GoogleGenerativeAIEmbeddings {
  if (!embeddings) {
    embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_API_KEY!,
      modelName: "embedding-001",
    });
  }
  return embeddings;
}
