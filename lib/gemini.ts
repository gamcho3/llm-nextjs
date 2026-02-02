import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

let model: ChatGoogleGenerativeAI | null = null;

export function getGeminiModel(): ChatGoogleGenerativeAI {
  if (!model) {
    model = new ChatGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_API_KEY!,
      model: "gemini-2.5-flash-lite",
      temperature: 0.3, // 0 = 정확, 1 = 창의적
      maxOutputTokens: 1024,
    });
  }
  return model;
}
