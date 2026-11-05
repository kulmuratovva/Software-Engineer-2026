import { CalendarClock } from 'lucide-react';
import type { Booking } from '@/domain/types';
import { MAX_DURATION, MINUTE_CAP, toHHMM } from '@/domain/time';

export default function BookingsPanel({ bookings }: { bookings: Booking[] }) {
  return (
    <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <CalendarClock className="h-4 w-4 text-sky-600" />
        <h2 className="text-base font-semibold text-slate-900">Existing bookings</h2>
        <span className="ml-auto text-xs text-slate-400">read-only</span>
      </div>
      {bookings.length === 0 && <p className="text-sm text-slate-500">No bookings for this room.</p>}
      <ul className="space-y-3">
        {bookings.map((b) => (
          <li key={b.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-800">{b.label}</p>
              <span className="text-xs text-slate-500">{b.end - b.start} min</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{toHHMM(b.start)} – {toHHMM(b.end)}</p>
            <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full bg-sky-500" style={{
                marginLeft: `${(b.start / MINUTE_CAP) * 100}%`,
                width: `${((b.end - b.start) / MINUTE_CAP) * 100}%`,
              }} />
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-5 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        <p className="font-medium text-slate-600 mb-1">Rules recap</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>00:00 ≤ start &lt; end ≤ 24:00; start &gt; current time.</li>
          <li>Duration ≤ {MAX_DURATION} min ({MAX_DURATION} allowed).</li>
          <li>Touching endpoints do not overlap.</li>
          <li>Blocked room is always unavailable.</li>
        </ul>
      </div>
    </section>
  );
}
