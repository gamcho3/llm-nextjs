// app/page.tsx
"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // 날씨 가져오기
  const fetchWeather = async () => {
    const res = await fetch("/api/weather");
    const data = await res.json();
    if (data.success) {
      setWeather(data.data);
    }
  };

  // 검색
  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        weather: weather?.condition,
        limit: 5,
      }),
    });

    const data = await res.json();
    if (data.success) {
      setResults(data.results);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏝️ 제주 여행 안내
          </h1>
          <p className="text-gray-600">날씨 기반 맞춤 여행지 추천</p>
        </div>

        {/* 날씨 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          {!weather ? (
            <button
              onClick={fetchWeather}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              🌤️ 현재 제주 날씨 확인
            </button>
          ) : (
            <div className="text-center">
              <p className="text-3xl mb-2">
                {weather.condition === "clear" && "☀️"}
                {weather.condition === "rain" && "🌧️"}
                {weather.condition === "cloud" && "☁️"}
                {weather.condition === "snow" && "❄️"}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {weather.temperature}°C
              </p>
              <p className="text-gray-600">{weather.description}</p>
            </div>
          )}
        </div>

        {/* 검색 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="어디로 가고 싶으신가요? (예: 해변, 박물관, 카페)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? "검색 중..." : "🔍 검색"}
            </button>
          </div>
          {weather && (
            <p className="text-sm text-gray-500 mt-2">
              💡 현재 날씨에 맞는 장소를 우선 추천합니다
            </p>
          )}
        </div>

        {/* 결과 */}
        {results.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              검색 결과 ({results.length}개)
            </h2>
            <div className="space-y-4">
              {results.map((place, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <h3 className="font-semibold text-lg text-gray-800 mb-1">
                    {i + 1}. {place.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    📍 {place.address}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm hover:underline"
                  >
                    🗺️ 지도에서 보기
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
