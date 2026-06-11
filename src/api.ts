import type { GeocodingResult, HourlyForecast, SavedLocation } from './types';

type ForecastResponse = {
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    uv_index: number[];
    weather_code: number[];
  };
};

export async function searchLocations(query: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: '6',
    language: 'en',
    format: 'json'
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);
  if (!response.ok) throw new Error('Location search failed.');
  const data = (await response.json()) as { results?: GeocodingResult[] };
  return data.results ?? [];
}

export async function fetchForecast(location: SavedLocation, date: string): Promise<HourlyForecast[]> {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'wind_speed_10m',
      'wind_gusts_10m',
      'uv_index',
      'weather_code'
    ].join(','),
    start_date: date,
    end_date: date,
    timezone: 'auto'
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!response.ok) throw new Error('Forecast failed.');
  const data = (await response.json()) as ForecastResponse;

  return data.hourly.time.map((time, index) => ({
    time,
    temperature: data.hourly.temperature_2m[index],
    apparentTemperature: data.hourly.apparent_temperature[index],
    rainProbability: data.hourly.precipitation_probability[index],
    windSpeed: data.hourly.wind_speed_10m[index],
    windGust: data.hourly.wind_gusts_10m[index],
    uvIndex: data.hourly.uv_index[index],
    weatherCode: data.hourly.weather_code[index]
  }));
}
