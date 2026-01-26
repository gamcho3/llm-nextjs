# 📄 Project: 문서 기반 Q&A 챗봇

## 1. 개요

사용자가 업로드한 PDF 문서를 AI가 실시간으로 학습(RAG)하여, 관련 질문에 대해 정확한 답변을 제공하는 웹 애플리케이션.

## 2. 핵심 기능

- **PDF 업로드:** 문서를 텍스트로 변환 및 벡터 데이터화.
- **RAG 검색:** 사용자 질문과 가장 유사한 문서 내용을 검색.
- **AI 채팅:** 검색된 내용을 근거로 Gemini AI가 답변 생성.

## 3. 기술 스택

- Frontend: Next.js (App Router), Tailwind CSS
- Backend: Next.js API Routes
- AI/ML: LangChain, Google Gemini Pro, Gemini Embeddings
