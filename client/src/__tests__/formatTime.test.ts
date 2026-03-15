import { describe, it, expect } from 'vitest';
import { formatTime } from '../utils/formatTime';

describe('formatTime', () => {
  it('formats zero seconds', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats 90 seconds as 01:30', () => {
    expect(formatTime(90)).toBe('01:30');
  });

  it('pads single-digit minutes and seconds', () => {
    expect(formatTime(65)).toBe('01:05');
  });

  it('formats large values', () => {
    expect(formatTime(3600)).toBe('60:00');
  });
});
