<!-- Copied/merged guidance for AI coding agents working on this repo -->
# Copilot instructions for this repository

This file gives concise, actionable guidance for AI coding agents working on the Front (Vite + React) frontend.

**Purpose:** help contributors be productive quickly: how the app is structured, important conventions, and concrete examples to follow.

**How to run:**
- **Dev:** `npm run dev` (Vite; entry is `src/main.tsx`).
- **Build:** `npm run build`
- **Preview:** `npm run preview`
- **Lint:** `npm run lint` (see `eslint.config.js`).

**Big picture architecture:**
- **Single-page React app** using Vite and TypeScript (tsx). Entry: `src/main.tsx`; main UI in `src/App.tsx`.
- App uses local component state (React hooks) and directly calls a backend API (no global store). Keep new features aligned with this simple pattern unless converting to a central store is required.
- **Backend API:** the frontend expects a local API at `http://localhost:5272/api` (see `API_BASE` constant in `src/App.tsx`). Key endpoints used:
  - `GET/POST/PUT/DELETE /Pessoa`
  - `GET/POST /Transacao`
  - `GET /Categoria`
  Example usage pattern: `const res = await fetch(`${API_BASE}/Pessoa`); if (res.ok) {...} else { const txt = await res.text(); /* show message */ }`

**Project-specific conventions & patterns:**
- Strings and UI labels are in Portuguese; keep new user-facing text in Portuguese for consistency.
- UX uses simple `alert()` calls for success/error messages in many places — new features may keep this style unless explicitly replacing the UX approach.
- Data fetching pattern: components call `fetch`, check `res.ok`, then parse `res.json()` or `res.text()` for error details; mutations re-run the shared `fetchData()` function to refresh local state (see `src/App.tsx`). Follow this pattern rather than ad-hoc partial updates.
- Types: small inline TypeScript interfaces live in `src/App.tsx` (`Pessoa`, `Categoria`, `Transacao`). If you add more types, prefer adding `src/types.ts` and import them.
- Charts: Chart.js is used via `react-chartjs-2` and registered with `ChartJS.register(...)` in `src/App.tsx`. Reuse `getChartData()` approach for category aggregation.
- Styling: global styles in `src/index.css` and component styles in `src/App.css`. New components should add local CSS under `src/` and import them from the component file.

**Lint / formatting:**
- ESLint configuration is in `eslint.config.js`. Run `npm run lint` to check JS/JSX. Be cautious: the repo uses TypeScript files (`.tsx`) but the provided ESLint config is focused on JS; adjust lint rules only if necessary and with a PR comment.

**When adding API clients or services:**
- Prefer centralizing `API_BASE` into a small `src/config.ts` if multiple new files will use it. Example constant: `export const API_BASE = 'http://localhost:5272/api';`
- Keep network code consistent: always set `headers: {'Content-Type':'application/json'}` for JSON, check `res.ok`, and surface server `res.text()` on errors.

**Example snippets in this repo to mirror:**
- Controlled form inputs and submit handlers in `src/App.tsx` (see `handleRegistrarGasto` and `handleSalvarPessoa`).
- Chart aggregation via `getChartData(pId)` — produce labels and dataset arrays for `Pie` charts.

**Integration & environment notes:**
- Backend must be started separately (default API port 5272). Expect CORS to be required when running frontend + backend locally.
- Vite handles HMR; use `npm run dev` during iterative UI work.

**PR / commit guidance:**
- Keep commits focused and small. Mention relevant files changed and include a short manual test (e.g., "Ran `npm run dev`, created a new Pessoa, verified chart updates").
- Keep Portuguese UI strings consistent.

If anything is unclear or you want a different level of detail (more examples, new shared `src/` helpers), tell me which area to expand.
