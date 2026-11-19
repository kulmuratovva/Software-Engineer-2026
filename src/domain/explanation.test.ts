import { describe, it, expect } from 'vitest';
import type { Booking, CheckOutcome } from './types';
import {
  buildPrompt,
  validateExplanation,
  mockExplanationAdapter,
  type ExplanationRequest,
} from './explanation';

const BOOKINGS: Booking[] = [{ id: 1, label: 'Faculty Meeting', start: 600, end: 660 }];

function makeReq(outcome: CheckOutcome, overrides: Partial<ExplanationRequest> = {}): ExplanationRequest {
  return {
    roomName: 'Seminar Room 204',
    start: 660,
    end: 720,
    duration: 60,
    outcome,
    bookings: BOOKINGS,
    ...overrides,
  };
}

describe('buildPrompt', () => {
  it('summarises an available outcome with bookings', () => {
    const p = buildPrompt(makeReq({ kind: 'available' }));
    expect(p).toContain('Seminar Room 204');
    expect(p).toContain('660–720');
    expect(p).toContain('60 min');
    expect(p).toContain('available');
    expect(p).toContain('Faculty Meeting 600–660');
  });

  it('summarises an unavailable outcome with reasons', () => {
    const p = buildPrompt(
      makeReq({ kind: 'unavailable', reasons: ['End time must be after start time.'] })
    );
    expect(p).toContain('unavailable');
    expect(p).toContain('End time must be after start time.');
  });

  it('reports no existing bookings when the list is empty', () => {
    const p = buildPrompt(makeReq({ kind: 'available' }, { bookings: [] }));
    expect(p).toContain('no existing bookings');
  });
});

describe('validateExplanation', () => {
  it('accepts a non-empty string', () => {
    expect(validateExplanation('Looks good.')).toEqual({ kind: 'ok', text: 'Looks good.' });
  });

  it('trims surrounding whitespace', () => {
    expect(validateExplanation('  hi  ')).toEqual({ kind: 'ok', text: 'hi' });
  });

  it('rejects a non-string value', () => {
    expect(validateExplanation(42)).toEqual({ kind: 'error', reason: 'Adapter returned a non-string value.' });
    expect(validateExplanation(null)).toEqual({ kind: 'error', reason: 'Adapter returned a non-string value.' });
    expect(validateExplanation(undefined)).toEqual({ kind: 'error', reason: 'Adapter returned a non-string value.' });
  });

  it('rejects an empty or whitespace-only string', () => {
    expect(validateExplanation('')).toEqual({ kind: 'error', reason: 'Adapter returned an empty explanation.' });
    expect(validateExplanation('   ')).toEqual({ kind: 'error', reason: 'Adapter returned an empty explanation.' });
  });

  it('rejects output longer than 600 characters', () => {
    const long = 'x'.repeat(601);
    const res = validateExplanation(long);
    expect(res.kind).toBe('error');
    if (res.kind === 'error') expect(res.reason).toContain('600');
  });
});

describe('mockExplanationAdapter', () => {
  it('returns a deterministic available explanation', async () => {
    const res = await mockExplanationAdapter.explain(makeReq({ kind: 'available' }));
    expect(res.kind).toBe('ok');
    if (res.kind === 'ok') {
      expect(res.text).toContain('Seminar Room 204');
      expect(res.text).toContain('available');
      expect(res.text).toContain('660–720');
      expect(res.text).toContain('60 minutes');
    }
  });

  it('returns a deterministic unavailable explanation with reasons', async () => {
    const res = await mockExplanationAdapter.explain(
      makeReq({ kind: 'unavailable', reasons: ['Overlaps existing booking "Faculty Meeting" (10:00–11:00).'] })
    );
    expect(res.kind).toBe('ok');
    if (res.kind === 'ok') {
      expect(res.text).toContain('unavailable');
      expect(res.text).toContain('Overlaps existing booking "Faculty Meeting" (10:00–11:00).');
    }
  });

  it('mentions no existing bookings when the room is empty', async () => {
    const res = await mockExplanationAdapter.explain(
      makeReq({ kind: 'available' }, { bookings: [] })
    );
    expect(res.kind).toBe('ok');
    if (res.kind === 'ok') expect(res.text).toContain('no existing bookings');
  });

  it('handles a null duration gracefully', async () => {
    const res = await mockExplanationAdapter.explain(
      makeReq({ kind: 'available' }, { duration: null })
    );
    expect(res.kind).toBe('ok');
    if (res.kind === 'ok') expect(res.text).toContain('unknown duration');
  });

  it('is deterministic — same input yields identical output across calls', async () => {
    const req = makeReq({ kind: 'available' });
    const a = await mockExplanationAdapter.explain(req);
    const b = await mockExplanationAdapter.explain(req);
    expect(a).toEqual(b);
  });
});
