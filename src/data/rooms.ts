import type { Room } from '@/domain/types';

// Fictional data only.
export const ROOMS: Room[] = [
  { id: '204', name: 'Seminar Room 204', capacity: 40, equipment: ['projector', 'whiteboard'], blocked: false,
    bookings: [{ id: 1, label: 'Faculty Meeting', start: 600, end: 660 }] },
  { id: '101', name: 'Computer Lab 101', capacity: 24, equipment: ['computers', 'projector'], blocked: false,
    bookings: [{ id: 2, label: 'Programming Lab', start: 720, end: 780 }] },
  { id: '305', name: 'Meeting Room 305', capacity: 8, equipment: ['whiteboard'], blocked: false, bookings: [] },
  { id: 'B12', name: 'Auditorium B12', capacity: 120, equipment: ['projector', 'microphone', 'whiteboard'],
    blocked: true, bookings: [] },
];
