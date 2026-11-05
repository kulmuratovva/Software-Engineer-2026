import { describe, it, expect } from 'vitest';
import { ROOMS } from '@/data/rooms';
import { filterRooms } from './filtering';
import { checkAvailability } from './availability';
import { durationMinutes, toMinutes } from './time';

const ids = (a: number, req: Parameters<typeof filterRooms>[1]['required'] = []) =>
  filterRooms(ROOMS, { attendees: a, required: req }).map((r) => r.id);

describe('F1: capacity filter', () => {
  it('keeps a room whose capacity equals attendees', () => expect(ids(24)).toContain('101'));
  it('drops a room with insufficient capacity (25 > 24)', () => expect(ids(25)).not.toContain('101'));
});

describe('F2: equipment filter requires ALL items', () => {
  it('drops rooms missing one required item', () =>
    expect(ids(0, ['projector', 'microphone'])).toEqual(['B12']));
  it('keeps rooms having every required item', () =>
    expect(ids(0, ['projector', 'whiteboard'])).toEqual(['204', 'B12']));
});

describe('F3: blocked room', () => {
  it('is never available and names the correct room', () => {
    const room = ROOMS.find((r) => r.blocked)!;
    const res = checkAvailability({ start: 700, end: 760, now: 540, blocked: room.blocked, bookings: room.bookings, roomName: room.name });
    expect(res.kind).toBe('unavailable');
    expect(JSON.stringify(res)).toContain('Auditorium B12');
  });
});

describe('F4: empty state data', () => {
  it('returns no rooms when nothing matches', () => expect(ids(500)).toEqual([]));
});

describe('F5: bookings belong to the selected room', () => {
  const run = (id: string) => {
    const r = ROOMS.find((x) => x.id === id)!;
    return checkAvailability({ start: 730, end: 770, now: 540, blocked: r.blocked, bookings: r.bookings }).kind;
  };
  it('room 101 is busy at 12:10–12:50', () => expect(run('101')).toBe('unavailable'));
  it('room 305 is free for the same time', () => expect(run('305')).toBe('available'));
});

describe('time helpers', () => {
  it('accepts 24:00 only as End', () => {
    expect(toMinutes('24:00', true)).toBe(1440);
    expect(toMinutes('24:00')).toBeNull();
  });
  it('duration is null when end is not after start', () => expect(durationMinutes(720, 660)).toBeNull());
});
