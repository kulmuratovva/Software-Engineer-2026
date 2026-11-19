// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';
import { fallbackFor, type ExplanationAdapter, type ExplanationOutput } from '@/domain/explain';

afterEach(cleanup);

// Controllable adapter for case 13 (in-flight request). In "immediate" mode
// it mimics the real mock; in "pending" mode the promise never resolves until
// pendingResolve is called manually.
const { adapterState } = vi.hoisted(() => ({
  adapterState: {
    mode: 'immediate' as 'immediate' | 'pending',
    pendingResolve: null as null | ((out: { explanation: string }) => void),
  },
}));

vi.mock('@/domain/explain', async (importOriginal) => {
  const actual = await importOriginal() as typeof import('@/domain/explain');
  const controllable: ExplanationAdapter = {
    explain: (input) => {
      if (adapterState.mode === 'pending') {
        return new Promise<ExplanationOutput>((resolve) => {
          adapterState.pendingResolve = resolve;
        });
      }
      return Promise.resolve({ explanation: actual.fallbackFor(input.reasonCode) });
    },
  };
  return { ...actual, mockExplanationAdapter: controllable };
});

beforeEach(() => {
  adapterState.mode = 'immediate';
  adapterState.pendingResolve = null;
});

const timeInputs = () => screen.getAllByPlaceholderText('HH:MM');
const checkBtn = () => screen.getByRole('button', { name: /check availability/i });
const explainBtn = () => screen.getByRole('button', { name: /explain availability/i });

function doCheck() {
  fireEvent.click(checkBtn());
}

async function doExplain() {
  await act(async () => {
    fireEvent.click(explainBtn());
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe('Explanation UI', () => {
  it('case 1: available room shows explanation text and label', async () => {
    render(<App />);
    doCheck();
    await doExplain();
    expect(screen.getByText('Generated explanation, not a booking confirmation')).toBeTruthy();
    expect(screen.getByText(fallbackFor('available'))).toBeTruthy();
  });

  it('case 2: overlap with existing booking shows overlap fallback', async () => {
    render(<App />);
    fireEvent.change(timeInputs()[0], { target: { value: '10:30' } });
    fireEvent.change(timeInputs()[1], { target: { value: '11:30' } });
    doCheck();
    await doExplain();
    expect(screen.getByText(fallbackFor('overlap'))).toBeTruthy();
  });

  it('case 3: blocked room (Auditorium B12) shows blocked fallback', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Auditorium B12/ }));
    doCheck();
    await doExplain();
    expect(screen.getByText(fallbackFor('blocked'))).toBeTruthy();
  });

  it('case 4: invalid time input shows errors and no explain button', async () => {
    render(<App />);
    fireEvent.change(timeInputs()[0], { target: { value: 'abc' } });
    doCheck();
    expect(screen.getByText(/Start time is empty or invalid/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /explain availability/i })).toBeNull();
  });

  it('case 5: past start time is unavailable, explanation matches startAfterNow', async () => {
    render(<App />);
    fireEvent.change(timeInputs()[0], { target: { value: '08:00' } });
    fireEvent.change(timeInputs()[1], { target: { value: '09:00' } });
    doCheck();
    expect(screen.getByText('Unavailable')).toBeTruthy();
    await doExplain();
    expect(screen.getByText(fallbackFor('startAfterNow'))).toBeTruthy();
  });

  it('case 11: checker verdict heading is identical before and after explain', async () => {
    render(<App />);
    doCheck();
    const headingBefore = screen.getByText('Available').textContent;
    await doExplain();
    const headingAfter = screen.getByText('Available').textContent;
    expect(headingAfter).toBe(headingBefore);
  });

  it('case 12: changing time after clicking explain clears the explanation', async () => {
    render(<App />);
    doCheck();
    await doExplain();
    expect(screen.getByText('Generated explanation, not a booking confirmation')).toBeTruthy();
    await act(async () => {
      fireEvent.change(timeInputs()[0], { target: { value: '13:00' } });
    });
    expect(screen.queryByText('Generated explanation, not a booking confirmation')).toBeNull();
    expect(screen.queryByText(fallbackFor('available'))).toBeNull();
  });

  it('case 13: in-flight explanation is not shown after input changes before resolve', async () => {
    adapterState.mode = 'pending';
    render(<App />);
    doCheck();
    expect(screen.getByText('Available')).toBeTruthy();

    // Click explain — promise stays pending, loading state shown
    await act(async () => { fireEvent.click(explainBtn()); });
    expect(screen.getByText('Explaining…')).toBeTruthy();

    // Change start time before promise resolves (triggers stale-result clear)
    await act(async () => {
      fireEvent.change(timeInputs()[0], { target: { value: '13:00' } });
    });
    expect(screen.queryByText('Available')).toBeNull();
    expect(screen.queryByText('Explaining…')).toBeNull();

    // Confirm the adapter was called and the promise is pending
    expect(adapterState.pendingResolve).not.toBeNull();

    // Resolve the pending promise with explanation text
    const oldText = 'This is the old explanation for the previous time slot.';
    await act(async () => {
      adapterState.pendingResolve?.({ explanation: oldText });
      await new Promise((r) => setTimeout(r, 0));
    });

    // Old explanation must NOT appear (submitted is false, ResultPanel returns null)
    expect(screen.queryByText(oldText)).toBeNull();
    expect(screen.queryByText('Generated explanation, not a booking confirmation')).toBeNull();
  });
});
