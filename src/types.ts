export type Sport = 'Pickleball' | 'Tennis' | 'Basketball';
export type Verdict = 'Play' | 'Maybe' | 'Pass';

export type SportPreset = {
  maxRainProbability: number;
  maxWindSpeed: number;
  maxWindGust: number;
  minComfortTemp: number;
  maxComfortTemp: number;
  maxUvIndex: number;
  windPenaltyMultiplier: number;
};

export type Preferences = {
  preferredStartHour: number;
  preferredEndHour: number;
  windSensitivity: number;
  heatTolerance: number;
  uvTolerance: number;
};

export type SavedLocation = {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type GeocodingResult = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

export type HourlyForecast = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  rainProbability: number;
  windSpeed: number;
  windGust: number;
  uvIndex: number;
  weatherCode: number;
};

export type ScoredHour = HourlyForecast & {
  score: number;
  verdict: Verdict;
  reasons: string[];
};

export type TimeWindow = {
  start: string;
  end: string;
  score: number;
  verdict: Verdict;
  reasons: string[];
};
