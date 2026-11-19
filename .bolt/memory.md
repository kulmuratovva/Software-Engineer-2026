# Project memory

## Product intent & audience

- Room booking/scheduling app: users book rooms for time slots subject to validation rules.
- Domain logic is separated from UI (`src/domain/*` vs `src/components/*`).

## Brand personality & voice

- Not inferred this turn.

## Visual design & UX direction

- `BookingsPanel` renders bookings as horizontal visual bars whose width is proportional to booking duration (`end - start`); each booking shows an "N min" label.
- Display data is pre-validated; UI components consume already-valid booking objects.

## Decisions, constraints & rationale

- `durationMinutes(start, end)` in `src/domain/time.ts` is the documented single source of truth for duration; returns `null` when `end ≤ start`.
- `src/domain/availability.ts` validates booking requests: time-range ordering, `start > now`, `MAX_DURATION` (120 min), blocked-room, and overlap (`start < b.end && b.start < end`); pushes structured rejection reasons (e.g. `endAfterStart`).
- Duration arithmetic (`end - start`) was duplicated in 3 raw-subtraction sites: `BookingsPanel.tsx` (display label + bar width) and `availability.ts` (max-duration check). `App.tsx` already uses the helper.
- Recommendation (read-only review, not yet implemented): **no design pattern needed** — Strategy/Adapter unjustified for a one-line subtraction. Use `durationMinutes` in `availability.ts` (guard `!== null`); use a local `const dur` in `BookingsPanel` to avoid a phantom null branch on invariant-valid data. No behavioral change.
- Design-pattern guidance for this project: prefer small helper functions over class/interface ceremony unless there is genuine polymorphism or interface mismatch.

## Open questions & assumptions

- Assumption: bookings reaching the UI are always pre-validated, so `start < end` is an invariant; `durationMinutes` null return is irrelevant in display paths.
- Proposed cleanup is optional and not yet applied (read-only review requested).
- Acceptance criteria in use: AC1 time rules, AC2 max 120 min, AC3 blocked room, AC4 overlap/touching, AC5 filters & room switching. Assessed as unaffected by the proposed refactor.