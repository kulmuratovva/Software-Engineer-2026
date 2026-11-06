import { describe, it, expect } from 'vitest';
import { ROOMS } from '@/data/rooms';
import { checkAvailability, type Booking } from './availability';
import { MAX_DURATION, MINUTE_CAP } from './time';
import { RULE_MESSAGES } from './rules';

const NOW = 540;
const BOOKINGS: Booking[] = [{ id: 1, label: 'Faculty Meeting', start: 600, end: 660 }];

function check(start: number, end: number, blocked = false, bookings: Booking[] = BOOKINGS, roomName?: string) {
  return checkAvailability({ start, end, now: NOW, blocked, bookings, roomName });
}

function reasonsOf(result: ReturnType<typeof check>): string[] {
  return result.kind === 'unavailable' ? result.reasons : [];
}

describe('shared limits', () => {
  it('maximum duration is 120 minutes', () => expect(MAX_DURATION).toBe(120));
  it('day cap is 1440 minutes', () => expect(MINUTE_CAP).toBe(1440));
  it('accepts a window ending exactly at the 1440-minute cap', () =>
    expect(check(1380, MINUTE_CAP).kind).toBe('available'));
  it('rejects a window ending past the 1440-minute cap', () =>
    expect(reasonsOf(check(1380, MINUTE_CAP + 1))).toContain(RULE_MESSAGES.timeRange));
});

describe('AC1: past time is rejected', () => {
  it('rejects a start before the current time with the start-after-now reason', () => {
    expect(reasonsOf(check(500, 530))).toContain(RULE_MESSAGES.startAfterNow);
  });
});

describe('AC1: reversed interval is rejected', () => {
  it('rejects end before start with the end-after-start reason', () => {
    expect(reasonsOf(check(720, 700))).toContain(RULE_MESSAGES.endAfterStart);
  });
});

describe('AC2: 121-minute duration is rejected', () => {
  it('rejects 121 minutes with the duration reason', () => {
    expect(reasonsOf(check(700, 821))).toEqual([RULE_MESSAGES.duration(121)]);
  });
});

describe('AC3: blocked room is rejected', () => {
  it('rejects a free slot in a blocked room with the blocked reason', () => {
    expect(reasonsOf(check(700, 760, true, [], 'Auditorium B12'))).toEqual([
      RULE_MESSAGES.blocked('Auditorium B12'),
    ]);
  });
  it('treats the blocked fixture room as unavailable', () => {
    const room = ROOMS.find((r) => r.blocked)!;
    expect(check(700, 760, room.blocked, room.bookings, room.name).kind).toBe('unavailable');
  });
});

describe('AC4: overlap is rejected', () => {
  it('rejects a slot overlapping an existing booking with the overlap reason', () => {
    expect(reasonsOf(check(630, 690))).toEqual([RULE_MESSAGES.overlap('Faculty Meeting', 600, 660)]);
  });
});

describe('AC4: touching endpoints are allowed', () => {
  it('allows a slot starting exactly when a booking ends', () => {
    expect(check(660, 720).kind).toBe('available');
  });
  it('allows a slot ending exactly when a booking starts', () => {
    expect(check(550, 600).kind).toBe('available');
  });
});

describe('AC5: fixtures are unchanged by checks', () => {
  it('leaves every room fixture identical after checking several windows', () => {
    const snapshot = JSON.parse(JSON.stringify(ROOMS));
    for (const room of ROOMS) {
      for (const [start, end] of [[600, 660], [660, 720], [700, 821], [1380, 1440]]) {
        checkAvailability({ start, end, now: NOW, blocked: room.blocked, bookings: room.bookings, roomName: room.name });
      }
    }
    expect(ROOMS).toEqual(snapshot);
  });
});
