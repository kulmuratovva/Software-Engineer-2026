import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, DoorClosed, Sparkles } from 'lucide-react';
import { ROOMS } from '@/data/rooms';
import type { CheckOutcome, Equipment } from '@/domain/types';
import { checkAvailability } from '@/domain/availability';
import { filterRooms } from '@/domain/filtering';
import { DEFAULTS, MAX_DURATION, durationMinutes, formatDuration, toMinutes } from '@/domain/time';
import TimeField from '@/components/TimeField';
import RoomPicker from '@/components/RoomPicker';
import ResultPanel from '@/components/ResultPanel';
import BookingsPanel from '@/components/BookingsPanel';

export default function App() {
  const [attendees, setAttendees] = useState('');
  const [required, setRequired] = useState<Equipment[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(ROOMS[0].id);
  const [startTime, setStartTime] = useState<string>(DEFAULTS.start);
  const [endTime, setEndTime] = useState<string>(DEFAULTS.end);
  const [nowTime, setNowTime] = useState<string>(DEFAULTS.now);
  const [outcome, setOutcome] = useState<CheckOutcome | null>(null);
  const [inputErrors, setInputErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const visibleRooms = useMemo(
    () => filterRooms(ROOMS, { attendees: Math.max(0, Number(attendees) || 0), required }),
    [attendees, required]
  );
  const room = visibleRooms.find((r) => r.id === selectedId) ?? null;

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime, true);
  const nowMin = toMinutes(nowTime);
  const duration = durationMinutes(startMin, endMin);

  const clearResult = () => { setSubmitted(false); setOutcome(null); setInputErrors([]); };
  // F5: any input or room change clears a stale result.
  useEffect(clearResult, [startTime, endTime, nowTime, selectedId, attendees, required]);

  const handleCheck = () => {
    if (!room) return;
    const errors = [
      startMin === null && 'Start time is empty or invalid (use HH:MM).',
      endMin === null && 'End time is empty or invalid (use HH:MM).',
      nowMin === null && 'Current time is empty or invalid (use HH:MM).',
    ].filter(Boolean) as string[];
    setSubmitted(true);
    setInputErrors(errors);
    setOutcome(
      errors.length > 0
        ? null
        : checkAvailability({
            start: startMin as number, end: endMin as number, now: nowMin as number,
            blocked: room.blocked, bookings: room.bookings, roomName: room.name,
          })
    );
  };

  const handleReset = () => {
    setStartTime(DEFAULTS.start); setEndTime(DEFAULTS.end); setNowTime(DEFAULTS.now);
    clearResult();
  };

  const toggle = (item: Equipment) =>
    setRequired((cur) => (cur.includes(item) ? cur.filter((i) => i !== item) : [...cur, item]));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50 text-slate-800">
      <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-600 text-white shadow-sm">
            <DoorClosed className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Smart Campus Room Availability Checker</h1>
            <p className="text-xs sm:text-sm text-slate-500">Check only — this tool does not create or confirm bookings.</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
        <RoomPicker
          attendees={attendees} onAttendees={setAttendees} required={required} onToggle={toggle}
          rooms={visibleRooms} selectedId={room?.id ?? null} onSelect={setSelectedId}
        />

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" />
              <h2 className="text-base font-semibold text-slate-900">
                {room ? `Check a time window — ${room.name}` : 'Check a time window'}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <TimeField label="Start time" hint="HH:MM" value={startTime} onChange={setStartTime} />
              <TimeField label="End time" hint="HH:MM · 24:00 allowed" value={endTime} onChange={setEndTime} />
              <TimeField label="Current time" hint={`HH:MM · default ${DEFAULTS.now}`} value={nowTime} onChange={setNowTime} />
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>
                Duration: <span className="font-medium text-slate-800">{formatDuration(duration)}</span>
                {duration !== null && duration > MAX_DURATION && (
                  <span className="ml-2 text-rose-600 font-medium">(exceeds {MAX_DURATION} min limit)</span>
                )}
              </span>
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={handleCheck} disabled={!room}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:opacity-50">
                <CheckCircle2 className="h-4 w-4" /> Check availability
              </button>
              <button type="button" onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Reset
              </button>
            </div>
            {!room && <p className="mt-4 text-sm text-slate-500">Select a room above to check its availability.</p>}
            <ResultPanel submitted={submitted} inputErrors={inputErrors} outcome={outcome}
              startMin={startMin} endMin={endMin} duration={duration} />
          </section>
          <BookingsPanel bookings={room?.bookings ?? []} />
        </div>

        <footer className="mt-10 text-center text-xs text-slate-400">
          Prototype · fictional data · client-side only · no bookings are created.
        </footer>
      </main>
    </div>
  );
}
