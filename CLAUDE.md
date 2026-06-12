# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
make install          # Install dependencies (npm ci)
make dev              # Start dev server at localhost:5173
make build            # TypeScript check + production build (required before commit)
make preview          # Build and preview production bundle
make deploy           # Deploy to Vercel production
make deploy-preview   # Create Vercel preview deployment
```

## Architecture

Frontend-only React/TypeScript/Vite app for outdoor sports weather recommendations. No backend—uses Open-Meteo (free, no API key) and browser localStorage.

**Source files in `src/`:**
- `App.tsx` — Main UI component (single-page app)
- `api.ts` — Open-Meteo API calls for geocoding and hourly forecasts
- `scoring.ts` — Recommendation algorithm: scores hours 0-100 based on weather conditions, returns Play/Maybe/Pass verdict
- `storage.ts` — localStorage persistence for locations, preferences, and forecast cache
- `config.ts` — Sport presets (Pickleball/Tennis/Basketball thresholds) and default preferences
- `types.ts` — TypeScript type definitions
- `i18n.ts` — English/Vietnamese display text

**Data flow:** Location search → forecast fetch → score each hour against sport preset + user preferences → rank 2-hour windows → display verdict.

## Constraints

- Client-only: no databases, no backend services, no paid APIs
- Styling via Tailwind utility classes
- No test framework yet; `make build` is the verification step
