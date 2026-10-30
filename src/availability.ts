export type Booking = {
  id: number;
  label: string;
  start: number; // minutes after midnight
  end: number;
};

export const MAX_DURATION = 120;
export const MINUTE_CAP = 1440;

export function toMinutes(value: string, allowMidnightEnd = false): number | null {
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

export function toHHMM(minutes: number): string {
  if (minutes === 1440) return '24:00';
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export type CheckOutcome =
  | { kind: 'available' }
  | { kind: 'unavailable'; reasons: string[] };

export function checkAvailability(args: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Booking[];
}): CheckOutcome {
  const { start, end, now, blocked, bookings } = args;
  const reasons: string[] = [];
  bookings.sort((a, b) => a.start - b.start);

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
    const overlaps = start <= b.end && b.start <= end;
    if (overlaps) {
      reasons.push(
        `Overlaps existing booking "${b.label}" (${toHHMM(b.start)}–${toHHMM(b.end)}).`
      );
    }
  }

  if (reasons.length === 0) {
    return { kind: 'available' };
  }
  return { kind: 'unavailable', reasons };
}
