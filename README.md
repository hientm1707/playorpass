# Play or Pass

Play or Pass is a frontend-only weather decision app for outdoor sports. Pick a sport, date, and location, and the app recommends whether to play or pass based on rain, wind, heat, UV, and user preferences.

Production: https://playorpass.vercel.app

## Features

- Sport presets for Pickleball, Tennis, and Basketball
- Location search powered by Open-Meteo geocoding
- Hourly forecast scoring and best-window recommendations
- English and Vietnamese UI
- Saved locations, preferences, language, and cached forecasts in `localStorage`
- Vercel production and preview deployment commands

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- Lucide React icons
- Open-Meteo APIs

## Project Structure

```text
src/
  App.tsx       Main UI and state flow
  api.ts        Open-Meteo geocoding and forecast calls
  config.ts     Sport presets and default preferences
  i18n.ts       English/Vietnamese copy
  scoring.ts    Forecast scoring and time-window logic
  storage.ts    localStorage helpers
  types.ts      Shared TypeScript types
public/         Static images and QR assets
```

## Getting Started

Install dependencies:

```sh
make install
```

Start the dev server:

```sh
make dev
```

Build for production:

```sh
make build
```

Preview the production bundle:

```sh
make preview
```

## Deployment

Deploy to Vercel production:

```sh
make deploy
```

Create a Vercel preview deployment:

```sh
make deploy-preview
```

The repository is linked to Vercel with `.vercel/project.json`. Credentials should remain in the local Vercel CLI config and must not be committed.

## Contributor Notes

See [AGENTS.md](./AGENTS.md) for repository guidelines, coding conventions, verification expectations, and commit workflow details.

Useful commit helpers:

```sh
make push MSG="chore: update docs"
make push-ai
```

There is no automated test suite yet. Run `make build` before committing.
