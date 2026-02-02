// app/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";

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

interface Message {
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
  const [messages, setMessages] = useState<Message[]>([]);
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
    const userMsg: Message = { role: "user", content: trimmed };
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

      const assistantMsg: Message = {
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
      {/* ── 헤더 ── */}
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">🍊 제주 여행 가이드</h1>
          {weather && (
            <div className="flex items-center gap-2 text-sm bg-blue-700 px-3 py-1 rounded-full">
              <img
                src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
                alt={weather.description}
                className="w-8 h-8"
              />
              <span>{weather.temperature}°C</span>
              <span className="opacity-80">| {weather.description}</span>
            </div>
          )}
        </div>
      </header>

      {/* ── 대화 영역 ── */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* 안내 메시지 */}
          {messages.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-4">🏝️</p>
              <p className="text-lg font-medium">
                제주 여행에 대해 물어보세요!
              </p>
              <p className="text-sm mt-2">
                날씨에 맞는 여행지를 추천해 드립니다
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {[
                  "오늘 날씨에 맞는 관광지 추천해줘",
                  "비 올 때 갈만한 실내 명소",
                  "제주 맛집 알려줘",
                  "성산일출봉 근처 볼거리",
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setInput(example)}
                    className="px-3 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 메시지 목록 */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* 말풍선 */}
              <div
                className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-br-md shadow-md"
                    : "bg-white text-gray-800 shadow rounded-bl-md border border-gray-100"
                }`}
              >
                {msg.content}
              </div>

              {/* 추천 장소 카드 (Assistant 메시지에만 표시) */}
              {msg.places && msg.places.length > 0 && (
                <div className="mt-3 w-full max-w-2xl overflow-x-auto pb-2">
                  <div className="flex gap-3">
                    {msg.places.map((place, idx) => (
                      <div
                        key={idx}
                        className="flex-shrink-0 w-64 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                      >
                        {/* 카드 헤더 (날씨) */}
                        <div className="bg-gray-50 px-4 py-2 border-b text-xs text-gray-500 flex justify-between items-center">
                          <span>{place.regionLabel || "제주"}</span>
                          {place.weather && (
                            <span className="flex items-center gap-1 font-medium text-blue-600">
                              {place.weather.description}{" "}
                              {place.weather.temperature}°C
                            </span>
                          )}
                        </div>

                        {/* 카드 본문 (정보) */}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-800 text-lg truncate">
                            {place.name}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {place.address || "주소 정보 없음"}
                          </p>

                          {/* 하단 버튼 */}
                          <div className="mt-4 pt-3 border-t flex justify-between items-center">
                            <a
                              href={`https://map.naver.com/v5/search/${encodeURIComponent(place.name)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-center flex-1 py-2 bg-green-50 text-green-700 rounded hover:bg-green-100 transition font-medium"
                            >
                              네이버 지도
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* 로딩 표시 */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl shadow rounded-bl-md border border-gray-100">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ── 입력 영역 ── */}
      <footer className="border-t bg-white p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="제주 여행에 대해 물어보세요..."
            className="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 transition"
          >
            전송
          </button>
        </div>
      </footer>
    </div>
  );
}
