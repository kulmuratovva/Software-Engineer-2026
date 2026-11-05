// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from './App';

afterEach(cleanup);
const room = (name: RegExp) => screen.getByRole('button', { name });

describe('UI behaviour', () => {
  it('shows Available for a valid request in the selected room', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
    expect(screen.getByText('Available')).toBeTruthy();
  });
  it('F5: switching room clears the old result and uses that room data', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
    fireEvent.click(room(/Auditorium B12/));
    expect(screen.queryByText('Available')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /check availability/i }));
    expect(screen.getByText('Unavailable')).toBeTruthy();
  });
  it('F4: shows an empty state when no room matches', () => {
    render(<App />);
    fireEvent.change(screen.getByPlaceholderText('e.g. 20'), { target: { value: '500' } });
    expect(screen.getByText(/No rooms match/)).toBeTruthy();
  });
});
