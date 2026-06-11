import { defaultPreferences } from './config';
import type { Language } from './i18n';
import type { Preferences, SavedLocation, Sport } from './types';

const keys = {
  sport: 'play-or-pass:sport',
  preferences: 'play-or-pass:preferences',
  locations: 'play-or-pass:locations',
  defaultLocationId: 'play-or-pass:default-location-id',
  cachedForecast: 'play-or-pass:cached-forecast',
  language: 'play-or-pass:language'
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function getInitialSport(): Sport {
  return (localStorage.getItem(keys.sport) as Sport | null) ?? 'Pickleball';
}

export function saveSport(sport: Sport) {
  localStorage.setItem(keys.sport, sport);
}

export function getPreferences(): Preferences {
  return { ...defaultPreferences, ...readJson<Partial<Preferences>>(keys.preferences, {}) };
}

export function savePreferences(preferences: Preferences) {
  localStorage.setItem(keys.preferences, JSON.stringify(preferences));
}

export function getSavedLocations(): SavedLocation[] {
  return readJson<SavedLocation[]>(keys.locations, []);
}

export function saveLocations(locations: SavedLocation[]) {
  localStorage.setItem(keys.locations, JSON.stringify(locations));
}

export function getDefaultLocationId(): string | null {
  return localStorage.getItem(keys.defaultLocationId);
}

export function saveDefaultLocationId(id: string | null) {
  if (id) localStorage.setItem(keys.defaultLocationId, id);
  else localStorage.removeItem(keys.defaultLocationId);
}

export function getCachedForecast<T>(): T | null {
  return readJson<T | null>(keys.cachedForecast, null);
}

export function saveCachedForecast<T>(value: T) {
  localStorage.setItem(keys.cachedForecast, JSON.stringify(value));
}

export function getLanguage(): Language {
  return (localStorage.getItem(keys.language) as Language | null) ?? 'en';
}

export function saveLanguage(language: Language) {
  localStorage.setItem(keys.language, language);
}
