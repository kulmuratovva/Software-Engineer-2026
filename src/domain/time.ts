export const MAX_DURATION = 120;
export const MINUTE_CAP = 1440;
export const DEFAULTS = { start: '11:00', end: '12:00', now: '09:00' } as const;

export function toMinutes(value: string, allowMidnightEnd = false): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (allowMidnightEnd && h === 24 && m === 0) return MINUTE_CAP;
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function toHHMM(minutes: number): string {
  if (minutes === MINUTE_CAP) return '24:00';
  const h = Math.floor(minutes / 60) % 24;
  return `${String(h).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}

/** Single source of truth for duration: null when end is not after start. */
export function durationMinutes(start: number | null, end: number | null): number | null {
  return start !== null && end !== null && end > start ? end - start : null;
}

export const formatDuration = (d: number | null) => (d === null ? '—' : `${d} min`);
