# Smart Campus Room Availability Checker

Single-page web prototype (React + TypeScript + Tailwind, built with Vite). It **only checks** whether a time window is free in a room of a small fictional catalog; it does not create or confirm bookings. No login, backend, database, external API or payments. All data is fictional.

Course: Software Engineering, Assignment #04 (AI-assisted software evolution, refactoring and quality improvement).
Student: Anel Kulmuratova (ID 24B032163). AI assistant: Claude (Claude Sonnet 5.5).

## What it does

- **Room catalog:** 4 fictional rooms (204, 101, 305, B12). Each has an id, name, capacity, equipment list, blocked status and its own bookings (`src/data/rooms.ts`).
- **Filters:** attendees (capacity >= attendees) and required equipment (the room must have **all** selected items). An empty state is shown when no room matches.
- **Availability check** for the selected room only. Rules (unchanged from the previous assignments):
  - AC1: times are whole minutes, 00:00-24:00; start must be strictly after the current time (default 09:00, fixed field).
  - AC2: at most 120 minutes (exactly 120 is allowed, 121 is not).
  - AC3: a blocked room is never available (room B12).
  - AC4: overlap with a booking of the same room is rejected; intervals that only touch are allowed.
  - AC5: clear "Available" / "Unavailable" result; the bookings data is never modified.
  - AC6: understandable messages and a responsive layout.
- Changing the selected room or any input clears the previous result.

## Setup

Requires Node.js 18 or newer and npm.

```bash
npm install
```

## Run

```bash
npm run dev      # opens http://localhost:5173
npm run build    # production build into dist/
```

## Test

```bash
npm test         # = vitest run
```

Expected result of the final version: 3 test files, **24 tests passed**.

| File | Tests | Covers |
| --- | --- | --- |
| `src/domain/availability.test.ts` | 11 | AC1-AC5 (original regression tests, unchanged) |
| `src/domain/features.test.ts` | 10 | F1-F5, 24:00 only as End, duration helper |
| `src/App.test.tsx` | 3 | UI / integration (jsdom): Available, room switching, empty state |

Saved outputs of the real runs: `evidence/baseline_tests.txt` (baseline, 11 passed) and `evidence/final_tests.txt` (final, 24 passed).

## Project structure

```
src/
  data/rooms.ts            room catalog (data only)
  domain/
    types.ts               Room, Booking, CheckOutcome
    time.ts                constants, toMinutes, toHHMM, durationMinutes, formatDuration
    availability.ts        checkAvailability (booking rules AC1-AC4)
    filtering.ts           filterRooms (F1, F2)
  components/
    RoomPicker.tsx         filters, room list, empty state
    TimeField.tsx          one time input
    ResultPanel.tsx        Available / Unavailable / validation messages
    BookingsPanel.tsx      bookings of the selected room and rules recap
  App.tsx                  state and wiring
```

## Versions

- Initial version: tag `a4-baseline` (branch `main`).
- Final version: branch `assignment-04`, tag `a4-final`.

To compare: `git diff -M --stat a4-baseline assignment-04`.

## Known limitations

- Room data is stored in code; there is no persistence.
- Booking length in `BookingsPanel.tsx` still repeats `end - start` instead of using `durationMinutes`.
- `toHHMM` has no direct unit test; UI tests cover three scenarios.
- The responsive layout (AC6) is checked manually only.
