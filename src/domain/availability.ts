import type { Booking, CheckOutcome } from './types';
import { MAX_DURATION, MINUTE_CAP } from './time';
import { RULE_MESSAGES } from './rules';

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
    reasons.push(RULE_MESSAGES.timeRange);
  }
  if (!(start < end)) reasons.push(RULE_MESSAGES.endAfterStart);
  if (!(start > now)) reasons.push(RULE_MESSAGES.startAfterNow);
  const duration = end - start;
  if (duration > MAX_DURATION) {
    reasons.push(RULE_MESSAGES.duration(duration));
  }
  if (blocked) reasons.push(RULE_MESSAGES.blocked(roomName));

  for (const b of bookings) {
    if (start < b.end && b.start < end) {
      reasons.push(RULE_MESSAGES.overlap(b.label, b.start, b.end));
    }
  }
  return reasons.length === 0 ? { kind: 'available' } : { kind: 'unavailable', reasons };
}
