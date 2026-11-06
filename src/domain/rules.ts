import { MAX_DURATION, MINUTE_CAP, toHHMM } from './time';

export const INPUT_ERRORS = {
  start: 'Start time is empty or invalid (use HH:MM).',
  end: 'End time is empty or invalid (use HH:MM).',
  now: 'Current time is empty or invalid (use HH:MM).',
};

export const DURATION_LIMIT_NOTE = `exceeds ${MAX_DURATION} min limit`;

export const RECAP_RULES = [
  '00:00 ≤ start < end ≤ 24:00; start > current time.',
  `Duration ≤ ${MAX_DURATION} min (${MAX_DURATION} allowed).`,
  'Touching endpoints do not overlap.',
  'Blocked room is always unavailable.',
];

export const RULE_MESSAGES = {
  timeRange: `Times must stay within 00:00–24:00 (0–${MINUTE_CAP} minutes).`,
  endAfterStart: 'End time must be after start time.',
  startAfterNow: 'Start time must be strictly after the current time.',
  duration: (duration: number) =>
    `Duration is ${duration} minutes — maximum allowed is ${MAX_DURATION} minutes.`,
  blocked: (roomName: string) => `${roomName} is currently blocked by the administrator.`,
  overlap: (label: string, start: number, end: number) =>
    `Overlaps existing booking "${label}" (${toHHMM(start)}–${toHHMM(end)}).`,
};
