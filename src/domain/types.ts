export type Booking = { id: number; label: string; start: number; end: number };
export type Equipment = 'projector' | 'whiteboard' | 'computers' | 'microphone';
export type Room = {
  id: string;
  name: string;
  capacity: number;
  equipment: Equipment[];
  blocked: boolean;
  bookings: Booking[];
};
export type CheckOutcome =
  | { kind: 'available' }
  | { kind: 'unavailable'; reasons: string[] };
