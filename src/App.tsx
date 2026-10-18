import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  CalendarClock,
  DoorClosed,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

type Booking = {
  id: number;
  label: string;
  start: number; // minutes after midnight
  end: number;
};

const ROOM_NUMBER = '204';
const ROOM_NAME = 'Seminar Room 204 — Engineering Block';

const EXISTING_BOOKINGS: Booking[] = [
  { id: 1, label: 'Faculty Meeting', start: 600, end: 660 }, // 10:00–11:00
];

const MAX_DURATION = 120;
const MINUTE_CAP = 1440;

function toMinutes(value: string, allowMidnightEnd = false): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(trimmed);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (allowMidnightEnd && h === 24 && m === 0) return 1440;
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
}

function toHHMM(minutes: number): string {
  if (minutes === 1440) return '24:00';
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

type CheckOutcome =
  | { kind: 'available' }
  | { kind: 'unavailable'; reasons: string[] };

function checkAvailability(args: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Booking[];
}): CheckOutcome {
  const { start, end, now, blocked, bookings } = args;
  const reasons: string[] = [];

  if (!(start >= 0 && end <= MINUTE_CAP)) {
    reasons.push('Times must stay within 00:00–24:00 (0–1440 minutes).');
  }
  if (!(start < end)) {
    reasons.push('End time must be after start time.');
  }
  if (!(start > now)) {
    reasons.push('Start time must be strictly after the current time.');
  }
  const duration = end - start;
  if (duration > MAX_DURATION) {
    reasons.push(
      `Duration is ${duration} minutes — maximum allowed is ${MAX_DURATION} minutes.`
    );
  }

  if (blocked) {
    reasons.push('Room 204 is currently blocked by the administrator.');
  }

  for (const b of bookings) {
    const overlaps = start < b.end && b.start < end;
    if (overlaps) {
      reasons.push(
        `Overlaps existing booking "${b.label}" (${toHHMM(b.start)}–${toHHMM(b.end)}).`
      );
    }
  }

  if (reasons.length === 0) {
    return { kind: 'available' };
  }
  // If blocked, treat as unavailable even if other rules also fired.
  return { kind: 'unavailable', reasons };
}

export default function App() {
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [nowTime, setNowTime] = useState('09:00');
  const [blocked, setBlocked] = useState(false);

  const [submitted, setSubmitted] = useState(false);
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [inputErrors, setInputErrors] = useState<string[]>([]);

  const startMin = useMemo(() => toMinutes(startTime), [startTime]);
  const endMin = useMemo(() => toMinutes(endTime, true), [endTime]);
  const nowMin = useMemo(() => toMinutes(nowTime), [nowTime]);

  // Clear any stale result/validation when the inputs that affect it change.
  useEffect(() => {
    setSubmitted(false);
    setOutcome(null);
    setInputErrors([]);
  }, [startTime, endTime, nowTime, blocked]);

  const handleCheck = () => {
    const errors: string[] = [];
    if (startMin === null) errors.push('Start time is empty or invalid (use HH:MM).');
    if (endMin === null) errors.push('End time is empty or invalid (use HH:MM).');
    if (nowMin === null) errors.push('Current time is empty or invalid (use HH:MM).');

    if (errors.length > 0) {
      setInputErrors(errors);
      setOutcome(null);
      setSubmitted(true);
      return;
    }

    setInputErrors([]);
    const result = checkAvailability({
      start: startMin as number,
      end: endMin as number,
      now: nowMin as number,
      blocked,
      bookings: EXISTING_BOOKINGS,
    });
    setOutcome(result);
    setSubmitted(true);
  };

  const handleReset = () => {
    setStartTime('11:00');
    setEndTime('12:00');
    setNowTime('09:00');
    setBlocked(false);
    setSubmitted(false);
    setOutcome(null);
    setInputErrors([]);
  };

  const duration =
    startMin !== null && endMin !== null && endMin > startMin
      ? endMin - startMin
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-800">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 text-white shadow-sm">
            <DoorClosed className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
              Smart Campus Room Availability Checker
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Check only — this tool does not create or confirm bookings.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Room banner */}
        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-slate-900 text-white text-xl font-semibold">
                {ROOM_NUMBER}
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">{ROOM_NAME}</p>
                <p className="text-sm text-slate-500">Capacity: 40 · Projector · Whiteboard</p>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${
                blocked
                  ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                  : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  blocked ? 'bg-rose-500' : 'bg-emerald-500'
                } animate-pulse`}
              />
              {blocked ? 'Blocked' : 'Operational'}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Input panel */}
          <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <h2 className="text-base font-semibold text-slate-900">Check a time window</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <TimeField
                label="Start time"
                hint="HH:MM"
                value={startTime}
                onChange={setStartTime}
              />
              <TimeField
                label="End time"
                hint="HH:MM · 24:00 allowed"
                value={endTime}
                onChange={setEndTime}
              />
              <TimeField
                label="Current time"
                hint="HH:MM · default 09:00"
                value={nowTime}
                onChange={setNowTime}
              />
            </div>

            {/* Duration preview */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>
                Duration:{' '}
                <span className="font-medium text-slate-800">
                  {duration === null ? '—' : `${duration} min`}
                </span>
                {duration !== null && duration > MAX_DURATION && (
                  <span className="ml-2 text-rose-600 font-medium">
                    (exceeds {MAX_DURATION} min limit)
                  </span>
                )}
              </span>
            </div>

            {/* Room blocked toggle */}
            <button
              type="button"
              onClick={() => setBlocked((v) => !v)}
              className={`mt-4 flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                blocked
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
              aria-pressed={blocked}
            >
              <span className="flex items-center gap-3">
                <AlertTriangle
                  className={`h-5 w-5 ${
                    blocked ? 'text-rose-600' : 'text-slate-400'
                  }`}
                />
                <span>
                  <span className="block text-sm font-medium text-slate-900">
                    Room blocked
                  </span>
                  <span className="block text-xs text-slate-500">
                    When on, every request returns Unavailable.
                  </span>
                </span>
              </span>
              <span
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                  blocked ? 'bg-rose-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    blocked ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </span>
            </button>

            {/* Actions */}
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCheck}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 active:scale-[.98]"
              >
                <CheckCircle2 className="h-4 w-4" />
                Check availability
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[.98]"
              >
                Reset
              </button>
            </div>

            {/* Validation messages */}
            {submitted && inputErrors.length > 0 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                  <AlertTriangle className="h-4 w-4" /> Please fix the following:
                </p>
                <ul className="mt-2 list-disc pl-6 text-sm text-amber-800 space-y-1">
                  {inputErrors.map((e) => (
                    <li key={e}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Result */}
            {submitted && outcome && (
              <div
                className={`mt-5 rounded-xl border p-5 ${
                  outcome.kind === 'available'
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-rose-200 bg-rose-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  {outcome.kind === 'available' ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-rose-600 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p
                      className={`text-base font-semibold ${
                        outcome.kind === 'available'
                          ? 'text-emerald-800'
                          : 'text-rose-800'
                      }`}
                    >
                      {outcome.kind === 'available' ? 'Available' : 'Unavailable'}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Requested window:{' '}
                      <span className="font-medium text-slate-800">
                        {startMin !== null ? toHHMM(startMin) : '—'}–
                        {endMin !== null ? toHHMM(endMin) : '—'}
                      </span>
                      {duration !== null ? (
                        <> · {duration} min</>
                      ) : (
                        <> · —</>
                      )}
                    </p>
                    {outcome.kind === 'unavailable' && (
                      <ul className="mt-2 list-disc pl-5 text-sm text-rose-800 space-y-1">
                        {outcome.reasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    )}
                    {outcome.kind === 'available' && (
                      <p className="mt-2 text-sm text-emerald-800">
                        No rule violations and no overlap with existing bookings.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Existing bookings */}
          <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-sky-600" />
              <h2 className="text-base font-semibold text-slate-900">
                Existing bookings
              </h2>
              <span className="ml-auto text-xs text-slate-400">read-only</span>
            </div>

            <ul className="space-y-3">
              {EXISTING_BOOKINGS.map((b) => (
                <li
                  key={b.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{b.label}</p>
                    <span className="text-xs text-slate-500">
                      {b.end - b.start} min
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {toHHMM(b.start)} – {toHHMM(b.end)}
                  </p>
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-sky-500"
                      style={{
                        marginLeft: `${(b.start / MINUTE_CAP) * 100}%`,
                        width: `${((b.end - b.start) / MINUTE_CAP) * 100}%`,
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              <p className="font-medium text-slate-600 mb-1">Rules recap</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>00:00 ≤ start &lt; end ≤ 24:00; start &gt; current time.</li>
                <li>Duration ≤ 120 min (120 allowed).</li>
                <li>Touching endpoints do not overlap.</li>
                <li>Blocked room is always unavailable.</li>
              </ul>
            </div>
          </section>
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Prototype · fictional data · client-side only · no bookings are created.
        </footer>
      </main>
    </div>
  );
}

function TimeField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600">{label}</span>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9:]*"
        placeholder="HH:MM"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      />
      <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>
    </label>
  );
}
