export type WeatherSnapshot = {
  temperature: number;
  feelsLike: number;
  rainChance: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  humidity: number;
  uvIndex: number;
  weatherCode: number;
  isDay: boolean;
  sunrise: Date;
  sunset: Date;
};

type OpenMeteoResponse = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
  daily: {
    precipitation_probability_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
};

export async function getWeather(latitude: number, longitude: number): Promise<WeatherSnapshot> {
  const parameters = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day',
    daily: 'precipitation_probability_max,uv_index_max,sunrise,sunset',
    forecast_days: '1',
    timezone: 'America/Sao_Paulo',
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${parameters}`);
  if (!response.ok) throw new Error('Não foi possível carregar o clima.');

  const data = await response.json() as OpenMeteoResponse;
  return {
    temperature: data.current.temperature_2m,
    feelsLike: data.current.apparent_temperature,
    rainChance: data.daily.precipitation_probability_max[0] ?? 0,
    precipitation: data.current.precipitation,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    humidity: data.current.relative_humidity_2m,
    uvIndex: data.daily.uv_index_max[0] ?? 0,
    weatherCode: data.current.weather_code,
    isDay: data.current.is_day === 1,
    sunrise: new Date(data.daily.sunrise[0]),
    sunset: new Date(data.daily.sunset[0]),
  };
}
