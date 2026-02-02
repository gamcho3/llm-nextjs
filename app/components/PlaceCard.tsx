// app/components/PlaceCard.tsx

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

interface PlaceCardProps {
  place: PlaceWithWeather;
}

export function PlaceCard({ place }: PlaceCardProps) {
  return (
    <div className="shrink-0 w-64 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* 카드 헤더 (날씨) */}
      <div className="bg-gray-50 px-4 py-2 border-b text-xs text-gray-500 flex justify-between items-center">
        <span>{place.regionLabel || "제주"}</span>
        {place.weather && (
          <span className="flex items-center gap-1 font-medium text-blue-600">
            {place.weather.description} {place.weather.temperature}°C
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
  );
}
