# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install all workspaces
npm install

# Dev server (builds shared first, then starts Vite HMR)
npm run dev

# Production build → dist/web/
npm run build

# Lint (web)
npm run lint

# Typecheck (web)
cd projects/web && npx tsc -b

# Typecheck (functions)
npm run build -w functions

# Build/deploy functions
npm run functions:build
npm run functions:deploy

# Rebuild shared package in isolation
npm run shared:build
```

CI runs `lint` + `typecheck` for both `web` and `functions` on every PR — these are the gate checks.

## Architecture

npm workspace monorepo under `projects/`:

- **`@figo/shared`** — Pure TypeScript business logic: work-time calculations, legal pause rules (ArbZG), break deduction, time formatting. No framework dependencies. All domain constants live in `constants.ts`. **Never put UI or Firebase logic here.**
- **`web`** — React 19 PWA (Vite 8, Tailwind CSS v4). Compiled output goes to `dist/web/`.
- **`functions`** — Firebase Functions v2 (Node.js 22). Single entry point: `projects/functions/src/index.ts`.

### Shared package aliasing

Vite resolves `@figo/shared` directly to the TypeScript source (`projects/shared/src/index.ts`) to avoid the ESM/CJS named-export mismatch at runtime. **Do not import from the `dist/` output in the web app.** The functions package has a `file:./shared` dependency and uses the compiled output.

### Firebase Realtime Database schema

```
/data/{userId}/
  startTime              — epoch ms (clock-in time)
  breaks/{id}/           — { start: ms, end: ms }
  dailyMaxOvertimeMinutes — number | null (user-defined cap)
  liveBreakStart         — epoch ms (open/live break in progress)

/users/{userId}/fcmTokens/{key}/
  token   — FCM registration token string
  lastSeen — epoch ms
```

All session state is read in `useSessionData` via a single `onValue` listener on `/data/{userId}`. Old sessions (not `isToday`) are auto-reset.

### Push notification flow

1. Any write to `/data/{userId}` triggers `onSessionDataWritten` (database trigger).
2. It enqueues `TARGET`, `LIMIT`, and optionally `DAILY_MAX` tasks into Cloud Tasks at the calculated finish times.
3. Cloud Tasks calls `onSendPushNotification` at schedule time. It re-validates session state before sending; if `startTime`, `breaksDurationMinutes`, or `dailyMaxOvertimeMinutes` have changed, the task is discarded (a newer one was enqueued).
4. A live break (`liveBreakStart` set) suppresses scheduling — push tasks are re-enqueued when the break ends.
5. FCM uses a **data-only payload** (no `notification` key) so the service worker (`sw.ts`) handles display via `onBackgroundMessage`, preventing duplicate notifications.

### Web component layout

```
src/
  hooks/          — Firebase-backed hooks (useAuth, useSessionData, useTimerCalculations, usePushNotifications)
  components/
    features/     — Domain-specific components (timer/, breaks/, auth/)
    layout/       — App shell, AppBar, modals
    ui/           — Reusable primitives (button, drawer, dialog, surface…)
  lib/            — Pure helpers (ring-geometry, break-placement, firebase-actions, time utils)
  config/         — Firebase init (firebase.ts exports auth, db, messagingPromise)
```

`useTimerCalculations` is the core hook — it ticks every second, derives all ring geometry and saldo display from `@figo/shared` functions, and returns a single `TimerCalculations` object consumed by `DisplayScreen`.

### Dev notes

- In `DEV` mode, Firebase Phone Auth has `appVerificationDisabledForTesting = true` (set in `firebase.ts`).
- App version (`__APP_VERSION__`) is injected at build time from `package.json` + git info in `vite.config.ts`.
- Tailwind v4 uses a CSS-first config (no `tailwind.config.js`); add design tokens in `src/index.css`.
- The path alias `@` maps to `projects/web/src`.
