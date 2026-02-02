// app/components/Header.tsx

interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface HeaderProps {
  weather: WeatherData | null;
}

export function Header({ weather }: HeaderProps) {
  return (
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
  );
}
