// app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "./components/Header";
import { Message } from "./components/Message";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { ChatInput } from "./components/ChatInput";

// ─── 타입 정의 ───
interface PlaceWithWeather {
  name: string;
  address: string;
  category?: string;
  latitude: number;
  longitude: number;
  weather?: {
    temperature: number;
    description: string;
    recommendation: string;
  };
  regionLabel?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  places?: PlaceWithWeather[];
}

interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

// ─── 메인 컴포넌트 ───
export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 스크롤 자동 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 날씨 불러오기
  useEffect(() => {
    fetch("/api/weather")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setWeather(data.weather);
      })
      .catch(console.error);
  }, []);

  // 메시지 전송
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    // 사용자 메시지 추가
    const userMsg: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.success
          ? data.answer
          : "죄송합니다. 오류가 발생했습니다.",
        places: data.success ? data.places : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "네트워크 오류가 발생했습니다." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Enter 키로 전송
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 헤더 */}
      <Header weather={weather} />

      {/* 대화 영역 */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 안내 메시지 */}
          {messages.length === 0 && (
            <WelcomeMessage onExampleClick={setInput} />
          )}

          {/* 메시지 목록 */}
          {messages.map((msg, i) => (
            <Message
              key={i}
              role={msg.role}
              content={msg.content}
              places={msg.places}
            />
          ))}

          {/* 로딩 표시 */}
          {loading && <LoadingSpinner />}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 입력 영역 */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />
    </div>
  );
}
