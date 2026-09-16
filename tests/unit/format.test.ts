import { describe, expect, it } from 'vitest';
import { getDayLabel, getShortDate } from '../../src/lib/format';

describe('format', () => {
  it('returns Hoje for index 0 and Amanhã for index 1', () => {
    expect(getDayLabel('2026-06-16', 0)).toBe('Hoje');
    expect(getDayLabel('2026-06-17', 1)).toBe('Amanhã');
  });

  it('returns the abbreviated weekday for later forecast days', () => {
    expect(getDayLabel('2026-06-18', 2)).toBe('Qui');
  });

  it('formats a date as day and abbreviated month', () => {
    expect(getShortDate('2026-06-16')).toBe('16 Jun');
  });
});
