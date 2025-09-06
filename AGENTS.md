# Repository Guidelines

## Project Structure & Module Organization
- App router: `app/` (Next.js 15). Each route is a folder with `page.tsx` and optional `loading.tsx`, `route.ts`.
- UI components: `components/` (PascalCase files, colocated styles via Tailwind).
- Shared logic & utils: `lib/`.
- Configuration: `config/` (e.g., E2B settings), root `next.config.ts`, `eslint.config.mjs`, `tailwind.config.ts`.
- Static assets: `public/`.
- Types: `types/`.
- Docs: `docs/`.
- Tests: standalone `test/` package (Node scripts for E2B sandbox checks).

## Build, Test, and Development Commands
- `npm run dev` — Start Next.js with Turbopack at `http://localhost:3000`.
- `npm run build` — Production build.
- `npm start` — Run built app.
- `npm run lint` — Lint with ESLint (Next + TS rules).
- E2B tests (from repo root):
  - `npm --prefix test install` — Install test deps.
  - `npm --prefix test run test:all` — Run sandbox tests.

## Coding Style & Naming Conventions
- Language: TypeScript (`strict: true`). Path alias `@/*` for root imports.
- Indentation: 2 spaces; single quotes or template strings as needed.
- Components: PascalCase filenames and exported components; hooks start with `use*`.
- Modules and utilities: camelCase filenames; prefer named exports.
- Styling: Tailwind CSS 4 with class utilities; dark mode via `class`.
- Linting: extends `next/core-web-vitals` and `next/typescript`; warnings for unused vars and hooks deps.

## Testing Guidelines
- Framework: Node-based scripts under `test/` (no Jest/Vitest in root).
- Env: `.env.local` requires `E2B_API_KEY` and `FIRECRAWL_API_KEY` for sandbox-related flows.
- Conventions: Place new test scripts in `test/` and add npm script entries (`test:xyz`).

## Commit & Pull Request Guidelines
- Commits: Present tense, concise scope first (e.g., "refactor: improve sandbox creation effect"). Conventional Commits are encouraged but not required.
- PRs: Include description, rationale, and screenshots for UI changes. Link related issues. Note env/config changes. Keep diffs focused; update docs when behavior changes.

## Security & Configuration Tips
- Never commit real API keys. Use `.env.local` and keep `.env.example` updated.
- Validate and sanitize any user-provided input passed to sandboxes.
