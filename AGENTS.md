# Repository Guidelines

## Project Structure & Module Organization

This is a frontend-only Vite, React, and TypeScript app. Source code lives in `src/`: `App.tsx` contains the main UI, `main.tsx` boots React, `api.ts` handles weather/location API calls, `scoring.ts` contains recommendation logic, `storage.ts` manages localStorage, and `i18n.ts` stores display copy. Static assets live in `public/`, including `chibi-hien.png` and `donation-qr.png`. Root config files include `tailwind.config.js`, `postcss.config.js`, `tsconfig*.json`, and `.vercel/project.json`.

## Build, Test, and Development Commands

Use `make help` to list supported workflows.

- `make install`: install npm dependencies from `package-lock.json`.
- `make dev`: start the Vite dev server on `0.0.0.0:5173`.
- `make build`: run TypeScript build checks and produce `dist/`.
- `make preview`: build and preview the production bundle on port `4173`.
- `make deploy`: deploy production to Vercel.
- `make deploy-preview`: create a Vercel preview deployment.
- `make push MSG='message'`: commit and push with a manual message.
- `make push-ai`: ask Codex to generate a commit message, then commit and push.

## Coding Style & Naming Conventions

Write TypeScript and React function components. Use two-space indentation in TSX/TS files and keep components small enough to scan. Prefer descriptive camelCase for functions and variables, PascalCase for components and exported types, and kebab-case for generated assets. Keep UI styling in Tailwind utility classes and shared CSS in `src/styles.css`. Do not introduce backend services, databases, or paid APIs; this app is client-only and uses Open-Meteo plus browser storage.

## Testing Guidelines

There is no test framework configured yet. Before committing, run `make build`; it is the current required verification step because it runs `tsc -b` and `vite build`. For future tests, prefer colocated files such as `src/scoring.test.ts` for pure logic and component tests named `*.test.tsx`.

## Commit & Pull Request Guidelines

Recent history uses short conventional-style messages such as `chore: add deployment helpers and remove build artifacts`. Prefer `feat:`, `fix:`, `chore:`, or `docs:` prefixes with a concise imperative summary. Pull requests should include a brief description, verification commands run, screenshots for visible UI changes, and any deployment notes. Link related issues when available.

## Security & Configuration Tips

Do not commit secrets or personal tokens. Vercel project metadata in `.vercel/project.json` is project linkage only; credentials stay in the local Vercel CLI config. Keep generated `dist/` output out of source changes unless intentionally publishing static build artifacts.
