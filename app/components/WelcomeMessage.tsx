// app/components/WelcomeMessage.tsx

interface WelcomeMessageProps {
  onExampleClick: (example: string) => void;
}

export function WelcomeMessage({ onExampleClick }: WelcomeMessageProps) {
  const examples = [
    "오늘 날씨에 맞는 관광지 추천해줘",
    "비 올 때 갈만한 실내 명소",
    "제주공항 근처 볼거리",
  ];

  return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-4xl mb-4">🏝️</p>
      <p className="text-lg font-medium">제주 여행에 대해 물어보세요!</p>
      <p className="text-sm mt-2">날씨에 맞는 여행지를 추천해 드립니다</p>
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {examples.map((example) => (
          <button
            key={example}
            onClick={() => onExampleClick(example)}
            className="px-3 py-2 bg-white border rounded-full text-sm text-gray-600 hover:bg-blue-50 hover:border-blue-300 transition"
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
