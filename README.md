# Smart Campus Room Availability Checker

Single-page web prototype (React + TypeScript + Tailwind, built with Vite). It **only checks** whether a time window is free in a room of a small fictional catalog; it does not create or confirm bookings. No login, backend, database, external API or payments. All data is fictional.

Course: Software Engineering, Assignment #05 (AI-assisted repository customization, agent readiness and risk governance). The project itself comes from Assignment #04.
Student: Anel Kulmuratova (ID 24B032163). AI tools: Bolt.new (read-only reviews and reviewed patches), Claude (guidance and report drafting).

## What it does

- **Room catalog:** 4 fictional rooms (204, 101, 305, B12). Each has an id, name, capacity, equipment list, blocked status and its own bookings (`src/data/rooms.ts`).
- **Filters:** attendees (capacity >= attendees) and required equipment (the room must have **all** selected items). An empty state is shown when no room matches.
- **Availability check** for the selected room only. Acceptance criteria (the same list as in `AGENTS.md`):
  - AC1: times are whole minutes, 00:00-24:00; start must be strictly after the current time (default 09:00, fixed field); end must be after start.
  - AC2: at most 120 minutes (exactly 120 is allowed, 121 is not).
  - AC3: a blocked room is never available (room B12).
  - AC4: overlap with a booking of the same room is rejected; intervals that only touch are allowed.
  - AC5: filters and room switching work; changing the selected room or any input clears the previous result, and a room hidden by the filters is not silently re-selected.
- Besides the five criteria: clear "Available" / "Unavailable" messages and a responsive layout (AC6 in earlier assignments). The layout is checked manually only.
- The bookings data is never modified.

## Setup

Tested with Node.js v26.13.1 and npm 11.20.0 locally, and Node 24 in CI (`.github/workflows/ci.yml`). Other Node versions are not verified, and there is no `engines` field yet.

```bash
npm ci           # reproducible install from package-lock.json
```

## Run

```bash
npm run dev      # opens http://localhost:5173
npm run build    # production build into dist/
```

## Checks

```bash
npm test             # = vitest run
npm run typecheck    # = tsc --noEmit
npm run lint         # = eslint .
npm run build        # = vite build
```

The same four checks run in GitHub Actions on every push and pull request (`.github/workflows/ci.yml`).

## Tests

Current result: **7 test files, 47 tests passed.** The Assignment #05 baseline was 6 files / 40 tests; the difference is the new `src/domain/time.test.ts` (7 tests).

| File | Tests | Covers |
| --- | --- | --- |
| `src/domain/availability.test.ts` | 11 | AC1-AC5 booking rules (original regression tests, unchanged) |
| `src/domain/features.test.ts` | 10 | Filters, 24:00 only as End, duration helper |
| `src/domain/rules.test.ts` | 13 | Individual booking rules |
| `src/domain/time.test.ts` | 7 | `toHHMM` for 0, 9, 600, 719, 1439 and 1440 (MINUTE_CAP) |
| `src/App.test.tsx` | 3 | UI / integration (jsdom): Available, room switching, empty state |
| `src/App.selection.test.tsx` | 1 | A room hidden by a filter is not silently re-selected |
| `src/components/ErrorBoundary.test.tsx` | 2 | Children render; fallback message when a child throws |

Saved outputs of the Assignment #05 runs are in `evidence/` (UTF-8 files named `a5_*.txt`).

## Project structure

```
.github/workflows/ci.yml   CI: npm ci, test, typecheck, lint, build
src/
  main.tsx                 entry point (App wrapped in ErrorBoundary)
  data/rooms.ts            room catalog (data only)
  domain/
    types.ts               Room, Booking, CheckOutcome
    time.ts                constants, toMinutes, toHHMM, durationMinutes, formatDuration
    availability.ts        checkAvailability (booking rules AC1-AC4)
    rules.ts               individual booking rules
    filtering.ts           filterRooms (capacity, equipment)
  components/
    RoomPicker.tsx         filters, room list, empty state
    TimeField.tsx          one time input
    ResultPanel.tsx        Available / Unavailable / validation messages
    BookingsPanel.tsx      bookings of the selected room and rules recap
    ErrorBoundary.tsx      fallback message instead of a blank page
  App.tsx                  state and wiring
AGENTS.md                  instructions and limits for coding agents
```

## Versions

- Assignment #04: tags `a4-baseline` and `a4-final`.
- Assignment #05: branch `assignment-05`, tags `a5-baseline` and `a5-final`.

To compare: `git diff -M --stat a5-baseline a5-final`.

## Known limitations

- Room data is stored in code; there is no persistence.
- `handleCheck` with invalid time input has no automated test (the guard works today).
- `TimeField` has no `aria-invalid` / `aria-describedby` for error messages.
- No Prettier config and no `engines` / `.nvmrc`; Node versions other than 24 and 26 are not verified.
- `npm audit` reports findings in development dependencies only; they were not changed.
- Test fixtures depend on fixed room IDs (101, 204, 305, B12).
- The responsive layout (AC6) is checked manually only; the ErrorBoundary is covered by unit tests, not by a real browser crash.