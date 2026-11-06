## Project
Smart Campus room availability checker; one room checked at a time, fictional data.
Purpose: a student checks whether a requested time slot is available.

## Structure
- Booking-rule function: src/domain/availability.ts
- Time helpers and limits (120 / 1440 min): src/domain/time.ts
- Room filtering: src/domain/filtering.ts
- UI: src/App.tsx, src/components/
- Fixture data: src/data/rooms.ts
- Tests: src/domain/availability.test.ts, src/domain/features.test.ts, src/App.test.tsx

## Acceptance criteria (must be preserved)
- AC1: reject start >= end and past requests.
- AC2: reject durations longer than 120 minutes.
- AC3: reject a blocked room.
- AC4: reject overlaps; allow bookings touching only at endpoints.
- AC5: do not mutate booking data.
- AC6: retain clear desktop/mobile feedback.

## Constraints
Preserve AC1-AC6; no backend, login or booking creation.
No new features or dependencies. Keep the existing UI layout, wording and interactions.

## Engineering rules
Prefer pure functions and minimal changes; use at most 2 justified patterns.
Do not mutate booking fixtures; keep responsive UI feedback.
Avoid Singleton, Factory or unnecessary class hierarchies.
Do not touch anything outside the single refactoring that was approved.

## Commands
Test command: npm test (runs `vitest run`)
Dev/preview: npm run dev

## Verification
Baseline: 3 test files, 24 tests passing.
Run existing tests and add focused regression tests.
Never weaken or delete existing assertions.
Report changed files, rationale and test evidence.