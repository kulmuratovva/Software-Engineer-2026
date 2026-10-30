import { describe, it, expect } from 'vitest';
import { checkAvailability, type Booking } from './availability';

const NOW = 540; // 09:00, фиксированное время

function makeBookings(): Booking[] {
  return [{ id: 1, label: 'Faculty Meeting', start: 600, end: 660 }]; // 10:00–11:00
}

function check(
  start: number,
  end: number,
  opts: { blocked?: boolean; bookings?: Booking[] } = {}
) {
  return checkAvailability({
    start,
    end,
    now: NOW,
    blocked: opts.blocked ?? false,
    bookings: opts.bookings ?? makeBookings(),
  });
}

describe('AC1: invalid and past requests', () => {
  it('rejects start == end', () => {
    expect(check(700, 700).kind).toBe('unavailable');
  });
  it('rejects start > end', () => {
    expect(check(720, 700).kind).toBe('unavailable');
  });
  it('rejects start before now', () => {
    expect(check(500, 530).kind).toBe('unavailable');
  });
  it('rejects start equal to now', () => {
    expect(check(540, 570).kind).toBe('unavailable');
  });
});

describe('AC2: maximum duration', () => {
  it('allows exactly 120 minutes', () => {
    expect(check(700, 820).kind).toBe('available');
  });
  it('rejects 121 minutes', () => {
    expect(check(700, 821).kind).toBe('unavailable');
  });
});

describe('AC3: blocked room', () => {
  it('rejects any request when blocked', () => {
    expect(check(700, 760, { blocked: true }).kind).toBe('unavailable');
  });
});

describe('AC4: overlaps', () => {
  it('rejects a real overlap', () => {
    expect(check(630, 690).kind).toBe('unavailable');
  });
  it('BUG-A: allows a request that starts exactly when a booking ends', () => {
    expect(check(660, 720).kind).toBe('available');
  });
  it('BUG-A: allows a request that ends exactly when a booking starts', () => {
    expect(check(550, 600).kind).toBe('available');
  });
});

describe('AC5: no data mutation', () => {
  it('BUG-B: does not change the bookings array', () => {
    const bookings: Booking[] = [
      { id: 2, label: 'Lab', start: 900, end: 960 },
      { id: 1, label: 'Faculty Meeting', start: 600, end: 660 },
    ];
    const snapshot = JSON.parse(JSON.stringify(bookings));
    check(700, 760, { bookings });
    expect(bookings).toEqual(snapshot);
  });
});