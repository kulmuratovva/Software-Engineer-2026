import type { Booking, CheckOutcome } from './types';
import { MAX_DURATION, MINUTE_CAP, toHHMM } from './time';

export type { Booking, CheckOutcome } from './types';

export function checkAvailability(args: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: Booking[];
  roomName?: string;
}): CheckOutcome {
  const { start, end, now, blocked, bookings, roomName = 'This room' } = args;
  const reasons: string[] = [];

  if (!(start >= 0 && end <= MINUTE_CAP)) {
    reasons.push('Times must stay within 00:00–24:00 (0–1440 minutes).');
  }
  if (!(start < end)) reasons.push('End time must be after start time.');
  if (!(start > now)) reasons.push('Start time must be strictly after the current time.');
  const duration = end - start;
  if (duration > MAX_DURATION) {
    reasons.push(`Duration is ${duration} minutes — maximum allowed is ${MAX_DURATION} minutes.`);
  }
  if (blocked) reasons.push(`${roomName} is currently blocked by the administrator.`);

  for (const b of bookings) {
    if (start < b.end && b.start < end) {
      reasons.push(`Overlaps existing booking "${b.label}" (${toHHMM(b.start)}–${toHHMM(b.end)}).`);
    }
  }
  return reasons.length === 0 ? { kind: 'available' } : { kind: 'unavailable', reasons };
}
