# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Framework caveat

This project uses Next.js 16.2.6 and React 19.2.4. This is not the older Next.js API surface from model training data: before changing Next.js app/router/config behavior, read the relevant guide in `node_modules/next/dist/docs/` and heed deprecation notices.

## Common commands

- `npm run dev` — start the Next.js development server at the default local port.
- `npm run build` — create a production Next.js build.
- `npm run start` — serve the production build after `npm run build`.
- `npm run lint` — run ESLint using `eslint.config.mjs` with Next core-web-vitals and TypeScript rules.
- `npm run test` — compile the engine and engine tests into `.tmp/tests`, then run them with Node's built-in test runner.
- Single engine test: `npx tsc src/game/types.ts src/game/engine.ts tests/engine.test.ts --module commonjs --target es2022 --outDir .tmp/tests --skipLibCheck && node --test --test-name-pattern "merges a row" .tmp/tests/tests/engine.test.js`

## Architecture overview

- The App Router entry is minimal: `app/page.tsx` renders `Game`, while `app/layout.tsx` owns page metadata, Chinese locale, mobile viewport settings, and global CSS import.
- `src/components/Game.tsx` is the client-side orchestrator. It initializes state after hydration, reads/writes best score from localStorage, wires keyboard input, and delegates board moves, undo, and new-game actions to the engine.
- `src/game/engine.ts` is framework-independent game logic. It owns board dimensions, tile IDs/animation flags, move/merge rules, random tile spawning, win/loss status, undo snapshots, and best-score progress calculation.
- `src/game/types.ts` defines shared board/state/direction types. Keep engine-facing state changes reflected there before updating components or tests.
- `src/game/storage.ts` is the only browser storage boundary for the best score and guards server-side execution with `typeof window` checks.
- Presentation components in `src/components/` are intentionally small and mostly stateless: board/tile rendering, score panel, status message, action buttons, and best-progress bar.
- Swipe support lives in `src/hooks/useSwipe.ts` and uses pointer events with a default 28px threshold; `GameBoard` applies `touch-none` so swipes control the game rather than page scrolling.
- Tests in `tests/engine.test.ts` target the pure engine through deterministic helpers such as `spawn: false` and custom random sources. The current test script uses `node:test`, not Vitest, despite Vitest being installed.

## Styling and conventions

- Tailwind CSS v4 is configured through `postcss.config.mjs`; global CSS uses `@import "tailwindcss"` and contains only app-wide base styles plus tile animations.
- Components use inline Tailwind utility classes and the `@/*` TypeScript path alias, which maps to the repository root.
- The UI is mobile-first and iOS-sized: preserve the fixed-height game shell, mobile viewport assumptions, Chinese copy, and swipe/keyboard parity when changing gameplay UI.
