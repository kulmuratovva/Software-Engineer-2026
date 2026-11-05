import type { Equipment, Room } from '@/domain/types';
import { ALL_EQUIPMENT } from '@/domain/filtering';

type Props = {
  attendees: string;
  onAttendees: (v: string) => void;
  required: Equipment[];
  onToggle: (item: Equipment) => void;
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function RoomPicker(p: Props) {
  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-slate-900">Find a room</h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className="block text-xs font-medium text-slate-600">Attendees</span>
          <input
            type="number" min={0} value={p.attendees} placeholder="e.g. 20"
            onChange={(e) => p.onAttendees(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          />
        </label>
        <fieldset className="sm:col-span-2">
          <legend className="text-xs font-medium text-slate-600">Required equipment (all selected)</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {ALL_EQUIPMENT.map((item) => (
              <label key={item} className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={p.required.includes(item)} onChange={() => p.onToggle(item)} />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {p.rooms.length === 0 ? (
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No rooms match. Lower the number of attendees or remove some equipment.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {p.rooms.map((r) => (
            <li key={r.id}>
              <button
                type="button" onClick={() => p.onSelect(r.id)} aria-pressed={r.id === p.selectedId}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  r.id === p.selectedId ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                  <span className={`text-xs font-medium ${r.blocked ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {r.blocked ? 'Blocked' : 'Operational'}
                  </span>
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Capacity {r.capacity} · {r.equipment.join(', ')}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
