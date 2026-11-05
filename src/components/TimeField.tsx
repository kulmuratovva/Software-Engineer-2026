export default function TimeField({ label, hint, value, onChange }: {
  label: string; hint: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-slate-600">{label}</span>
      <input
        type="text" inputMode="numeric" pattern="[0-9:]*" placeholder="HH:MM" value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
      />
      <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>
    </label>
  );
}
