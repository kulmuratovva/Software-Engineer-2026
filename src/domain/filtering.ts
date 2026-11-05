import type { Equipment, Room } from './types';

export const ALL_EQUIPMENT: Equipment[] = ['projector', 'whiteboard', 'computers', 'microphone'];

/** F1: capacity >= attendees. F2: room has ALL required items. */
export function filterRooms(
  rooms: Room[],
  { attendees, required }: { attendees: number; required: Equipment[] }
): Room[] {
  return rooms.filter(
    (r) => r.capacity >= attendees && required.every((item) => r.equipment.includes(item))
  );
}
