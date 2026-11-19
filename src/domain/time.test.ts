import { describe, it, expect } from 'vitest';
import { toHHMM, MINUTE_CAP } from './time';

describe('toHHMM', () => {
  it.each([
    [0, '00:00'],
    [9, '00:09'],
    [600, '10:00'],
    [719, '11:59'],
    [1439, '23:59'],
    [1440, '24:00'],
  ])('renders %i minutes as %s', (input, expected) => {
    expect(toHHMM(input)).toBe(expected);
  });

  it('1440 equals MINUTE_CAP', () => {
    expect(MINUTE_CAP).toBe(1440);
  });
});
