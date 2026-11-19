import type { Booking, CheckOutcome } from './types';

/**
 * Input for the optional explanation adapter.
 * The deterministic CheckOutcome remains authoritative; this input is derived
 * from already-validated values and is never used to recompute availability.
 */
export type ExplanationRequest = {
  roomName: string;
  start: number;
  end: number;
  duration: number | null;
  outcome: CheckOutcome;
  bookings: Booking[];
};

/** Adapter result is either a usable explanation or a structured failure. */
export type ExplanationResult =
  | { kind: 'ok'; text: string }
  | { kind: 'error'; reason: string };

/**
 * A pluggable explanation provider. The mock implementation is deterministic
 * so tests can assert exact output. A real adapter could call a server-side
 * endpoint (never embedding API keys in the client) but would implement the
 * same interface and handle its own failure modes.
 */
export type ExplanationAdapter = {
  explain: (req: ExplanationRequest) => Promise<ExplanationResult>;
};

/**
 * Build the textual summary the mock adapter turns into prose.
 * Pure function — no I/O, deterministic, easy to unit test.
 */
export function buildPrompt(req: ExplanationRequest): string {
  const { roomName, start, end, duration, outcome, bookings } = req;
  const window = `${start}–${end}`;
  const dur = duration === null ? 'unknown' : `${duration} min`;
  const verdict = outcome.kind === 'available' ? 'available' : `unavailable: ${outcome.reasons.join('; ')}`;
  const existing =
    bookings.length === 0
      ? 'no existing bookings'
      : bookings.map((b) => `${b.label} ${b.start}–${b.end}`).join(', ');
  return `Room ${roomName}, window ${window} (${dur}), verdict ${verdict}. Existing: ${existing}.`;
}

/** Maximum accepted explanation length — guards against runaway adapter output. */
const MAX_EXPLANATION_LEN = 600;

/**
 * Validate an adapter response before it reaches the UI.
 * Returns a structured failure for empty/overlong/non-string output so the
 * caller can show a graceful fallback instead of crashing.
 */
export function validateExplanation(raw: unknown): ExplanationResult {
  if (typeof raw !== 'string') return { kind: 'error', reason: 'Adapter returned a non-string value.' };
  const text = raw.trim();
  if (text.length === 0) return { kind: 'error', reason: 'Adapter returned an empty explanation.' };
  if (text.length > MAX_EXPLANATION_LEN)
    return { kind: 'error', reason: `Adapter output exceeded ${MAX_EXPLANATION_LEN} characters.` };
  return { kind: 'ok', text };
}

/**
 * Deterministic mock adapter. It never performs network I/O and always
 * returns the same prose for the same input, so it is safe to unit-test
 * and safe to ship as the default. The summary always restates the
 * deterministic verdict — it never overrides it.
 */
export const mockExplanationAdapter: ExplanationAdapter = {
  async explain(req: ExplanationRequest): Promise<ExplanationResult> {
    const { roomName, start, end, duration, outcome, bookings } = req;
    const lines: string[] = [];
    lines.push(`Room: ${roomName}.`);
    lines.push(`Requested window: ${start}–${end} (${duration === null ? 'unknown duration' : `${duration} minutes`}).`);

    if (outcome.kind === 'available') {
      lines.push('Result: available.');
      if (bookings.length === 0) {
        lines.push('This room has no existing bookings, so the window is clear.');
      } else {
        lines.push('Existing bookings do not overlap the requested window.');
      }
    } else {
      lines.push('Result: unavailable.');
      for (const reason of outcome.reasons) lines.push(`- ${reason}`);
    }

    return validateExplanation(lines.join(' '));
  },
};
