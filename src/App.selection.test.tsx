// @vitest-environment jsdom
// R2 regression: a room that was selected before a filter hid it must not be
// silently re-selected once the filter is relaxed.
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

afterEach(cleanup);

const roomButton = (name: RegExp) => screen.getByRole('button', { name });
const attendeesInput = () => screen.getByPlaceholderText('e.g. 20');

describe('R2: selection is not silently restored after filtering', () => {
  it('does not re-select Auditorium B12 after it was filtered out and back in', () => {
    render(<App />);

    const b12 = roomButton(/Auditorium B12/);
    fireEvent.click(b12);
    expect(b12.getAttribute('aria-pressed')).toBe('true');

    // Hide B12 (capacity 120) behind the attendees filter.
    fireEvent.change(attendeesInput(), { target: { value: '500' } });
    expect(screen.getByText(/No rooms match/)).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Auditorium B12/ })).toBeNull();

    // Relax the filter: B12 is visible again but must NOT be re-selected.
    fireEvent.change(attendeesInput(), { target: { value: '20' } });
    const b12Again = roomButton(/Auditorium B12/);
    expect(b12Again.getAttribute('aria-pressed')).toBe('false');
  });
});
