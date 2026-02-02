// app/components/Message.tsx

import { PlaceCard } from "./PlaceCard";

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

interface MessageProps {
  role: "user" | "assistant";
  content: string;
  places?: PlaceWithWeather[];
}

export function Message({ role, content, places }: MessageProps) {
  return (
    <div
      className={`flex flex-col ${
        role === "user" ? "items-end" : "items-start"
      }`}
    >
      {/* 말풍선 */}
      <div
        className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-wrap ${
          role === "user"
            ? "bg-blue-600 text-white rounded-br-md shadow-md"
            : "bg-white text-gray-800 shadow rounded-bl-md border border-gray-100"
        }`}
      >
        {content}
      </div>

      {/* 추천 장소 카드 (Assistant 메시지에만 표시) */}
      {places && places.length > 0 && (
        <div className="mt-3 w-full max-w-2xl overflow-x-auto pb-2">
          <div className="flex gap-3">
            {places.map((place, idx) => (
              <PlaceCard key={idx} place={place} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
