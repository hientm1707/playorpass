import { sportPresets } from './config';
import type { HourlyForecast, Preferences, ScoredHour, Sport, TimeWindow, Verdict } from './types';

const badWeatherCodes = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99]);

export function verdictForScore(score: number): Verdict {
  if (score >= 75) return 'Play';
  if (score >= 50) return 'Maybe';
  return 'Pass';
}

export function weatherLabel(code: number): string {
  if (code === 0) return 'Clear';
  if ([1, 2, 3].includes(code)) return 'Cloud mix';
  if ([45, 48].includes(code)) return 'Fog';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Drizzle';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Rain';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Snow';
  if ([95, 96, 99].includes(code)) return 'Storm risk';
  return 'Mixed';
}

export function scoreHour(hour: HourlyForecast, sport: Sport, preferences: Preferences): ScoredHour {
  const preset = sportPresets[sport];
  let score = 100;
  const reasons: string[] = [];

  if (hour.rainProbability > preset.maxRainProbability) {
    const penalty = (hour.rainProbability - preset.maxRainProbability) * 0.9;
    score -= penalty;
    reasons.push(`${Math.round(hour.rainProbability)}% rain risk`);
  }

  if (hour.windSpeed > preset.maxWindSpeed) {
    const penalty = (hour.windSpeed - preset.maxWindSpeed) * preset.windPenaltyMultiplier * preferences.windSensitivity;
    score -= penalty;
    reasons.push(`${Math.round(hour.windSpeed)} km/h wind`);
  }

  if (hour.windGust > preset.maxWindGust) {
    const penalty = (hour.windGust - preset.maxWindGust) * preset.windPenaltyMultiplier * 0.75 * preferences.windSensitivity;
    score -= penalty;
    reasons.push(`${Math.round(hour.windGust)} km/h gusts`);
  }

  const coolLimit = preset.minComfortTemp - (preferences.heatTolerance - 1) * 1.5;
  const heatLimit = preset.maxComfortTemp + (preferences.heatTolerance - 1) * 2;
  if (hour.apparentTemperature < coolLimit) {
    score -= (coolLimit - hour.apparentTemperature) * 3;
    reasons.push(`feels cool at ${Math.round(hour.apparentTemperature)}C`);
  }
  if (hour.apparentTemperature > heatLimit) {
    score -= (hour.apparentTemperature - heatLimit) * 4;
    reasons.push(`feels hot at ${Math.round(hour.apparentTemperature)}C`);
  }

  const uvLimit = preset.maxUvIndex + (preferences.uvTolerance - 1);
  if (hour.uvIndex > uvLimit) {
    score -= (hour.uvIndex - uvLimit) * 6;
    reasons.push(`UV ${Math.round(hour.uvIndex)} is punchy`);
  }

  if (badWeatherCodes.has(hour.weatherCode)) {
    score -= 18;
    reasons.push(weatherLabel(hour.weatherCode).toLowerCase());
  }

  const roundedScore = Math.max(0, Math.min(100, Math.round(score)));
  if (reasons.length === 0) reasons.push('court conditions look friendly');

  return {
    ...hour,
    score: roundedScore,
    verdict: verdictForScore(roundedScore),
    reasons: reasons.slice(0, 3)
  };
}

export function scoreForecast(hours: HourlyForecast[], sport: Sport, preferences: Preferences): ScoredHour[] {
  return hours
    .map((hour) => scoreHour(hour, sport, preferences))
    .filter((hour) => {
      const date = new Date(hour.time);
      const localHour = date.getHours();
      return localHour >= preferences.preferredStartHour && localHour < preferences.preferredEndHour;
    });
}

export function buildWindows(hours: ScoredHour[]): TimeWindow[] {
  const windows: TimeWindow[] = [];
  for (let index = 0; index < hours.length - 1; index += 1) {
    const first = hours[index];
    const second = hours[index + 1];
    const score = Math.round((first.score + second.score) / 2);
    const reasons = Array.from(new Set([...first.reasons, ...second.reasons])).slice(0, 3);
    windows.push({
      start: first.time,
      end: new Date(new Date(second.time).getTime() + 60 * 60 * 1000).toISOString(),
      score,
      verdict: verdictForScore(score),
      reasons
    });
  }
  return windows.sort((a, b) => b.score - a.score);
}
