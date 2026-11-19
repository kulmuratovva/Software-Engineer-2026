# AGENTS.md

## Purpose
Smart Campus Room Availability Checker: a client-side tool that checks whether a fictional
room is free for a requested time slot. It never creates or confirms bookings.

## Architecture
- src/data/rooms.ts: fictional room catalog (4 rooms, each with its own bookings)
- src/domain/: pure functions, no React
  - time.ts: time helpers and limits (120 / 1440 min)
  - availability.ts: booking-rule function
  - rules.ts: individual booking rules
  - filtering.ts: room filtering by capacity and equipment
  - types.ts: shared types
- src/components/: presentation only (RoomPicker, TimeField, ResultPanel, BookingsPanel, ErrorBoundary)
- src/App.tsx: state and wiring
- Tests (Vitest + jsdom + Testing Library): src/domain/availability.test.ts,
  src/domain/features.test.ts, src/domain/rules.test.ts, src/App.test.tsx,
  src/App.selection.test.tsx, src/components/ErrorBoundary.test.tsx

## Acceptance criteria (must stay true after every change)
- AC1: time rules: reject start >= end, a start in the past, and values outside 00:00-24:00.
- AC2: reject durations longer than 120 minutes (120 allowed, 121 rejected).
- AC3: a blocked room is always unavailable; the message names the selected room.
- AC4: reject real overlaps; allow bookings that touch only at endpoints.
- AC5: capacity and equipment filters work; switching the room or any input clears the old
  result; a room hidden by filters is not silently re-selected.

## Setup
npm ci

## Commands
Safe (allowed without asking):
- npm test (runs `vitest run`), npm run typecheck, npm run lint, npm run build
- npm run dev (local preview)
- git status, git diff, git log

Need human approval first:
- npm install <anything>, editing package.json or package-lock.json
- git commit, creating branches, deleting or renaming files

## Forbidden actions
- No secrets, tokens, .env files or real personal data; room data stays fictional.
- No production deployment, no hosting config, no push to a remote.
- No destructive commands: rm -rf, git reset --hard, git clean -fd, git push --force.
- No new or upgraded dependencies without review (do NOT run npm audit fix).
- Never edit, weaken or delete an existing test or assertion to make it pass; fix the code instead.
- No backend, login, database, external API, payments or booking creation.
- No new features; keep the existing UI layout, wording and interactions.

## Engineering rules
- Prefer pure functions and minimal changes; domain code stays free of React and I/O.
- Use at most 2 justified patterns; avoid Singleton, Factory and unnecessary class hierarchies.
- Do not mutate booking fixtures or booking data.
- Keep clear desktop and mobile feedback (responsive UI).
- Repeated values live in one place (src/domain/time.ts).
- Do not touch anything outside the task that was approved.

## Test expectations
- Every bug fix or new behaviour gets at least one focused test.
- Before proposing acceptance run: npm test, npm run typecheck, npm run lint, npm run build.
- Report exact pass/fail counts; never claim a result that was not executed.
- Baseline: 6 test files, 40 tests passing.
- Report changed files, rationale and test evidence.

## Review gates
- The agent shows a plan first and waits for approval before editing.
- The agent shows the exact diff; a human reviews it before it is kept.
- Only the files named in the task may be changed.