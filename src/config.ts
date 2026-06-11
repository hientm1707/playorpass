import type { Preferences, Sport, SportPreset } from './types';

export const sportPresets: Record<Sport, SportPreset> = {
  Pickleball: {
    maxRainProbability: 30,
    maxWindSpeed: 18,
    maxWindGust: 28,
    minComfortTemp: 18,
    maxComfortTemp: 33,
    maxUvIndex: 7,
    windPenaltyMultiplier: 2.0
  },
  Tennis: {
    maxRainProbability: 25,
    maxWindSpeed: 15,
    maxWindGust: 25,
    minComfortTemp: 17,
    maxComfortTemp: 32,
    maxUvIndex: 7,
    windPenaltyMultiplier: 2.5
  },
  Basketball: {
    maxRainProbability: 35,
    maxWindSpeed: 25,
    maxWindGust: 35,
    minComfortTemp: 16,
    maxComfortTemp: 34,
    maxUvIndex: 8,
    windPenaltyMultiplier: 1.0
  }
};

export const defaultPreferences: Preferences = {
  preferredStartHour: 7,
  preferredEndHour: 20,
  windSensitivity: 1,
  heatTolerance: 1,
  uvTolerance: 1
};

export const sports = Object.keys(sportPresets) as Sport[];
