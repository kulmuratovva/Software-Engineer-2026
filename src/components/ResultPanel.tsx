import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { CheckOutcome } from '@/domain/types';
import { formatDuration, toHHMM } from '@/domain/time';

type Props = {
  submitted: boolean;
  inputErrors: string[];
  outcome: CheckOutcome | null;
  startMin: number | null;
  endMin: number | null;
  duration: number | null;
};

export default function ResultPanel({ submitted, inputErrors, outcome, startMin, endMin, duration }: Props) {
  if (!submitted) return null;
  if (inputErrors.length > 0) {
    return (
      <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
          <AlertTriangle className="h-4 w-4" /> Please fix the following:
        </p>
        <ul className="mt-2 list-disc pl-6 text-sm text-amber-800 space-y-1">
          {inputErrors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      </div>
    );
  }
  if (!outcome) return null;
  const ok = outcome.kind === 'available';
  const Icon = ok ? CheckCircle2 : XCircle;
  return (
    <div className={`mt-5 rounded-xl border p-5 ${ok ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
      <div className="flex items-start gap-3">
        <Icon className={`h-6 w-6 shrink-0 ${ok ? 'text-emerald-600' : 'text-rose-600'}`} />
        <div className="min-w-0">
          <p className={`text-base font-semibold ${ok ? 'text-emerald-800' : 'text-rose-800'}`}>
            {ok ? 'Available' : 'Unavailable'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Requested window:{' '}
            <span className="font-medium text-slate-800">
              {startMin !== null ? toHHMM(startMin) : '—'}–{endMin !== null ? toHHMM(endMin) : '—'}
            </span>{' '}
            · {formatDuration(duration)}
          </p>
          {outcome.kind === 'unavailable' ? (
            <ul className="mt-2 list-disc pl-5 text-sm text-rose-800 space-y-1">
              {outcome.reasons.map((r) => <li key={r}>{r}</li>)}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-emerald-800">No rule violations and no overlap with existing bookings.</p>
          )}
        </div>
      </div>
    </div>
  );
}
