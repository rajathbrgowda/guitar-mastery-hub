import { test, expect } from 'vitest';
import { render } from '@testing-library/react';
import WeekStripMockup from './WeekStripMockup';

test('renders 7 day indicators', () => {
  const { container } = render(<WeekStripMockup />);
  // 7 day labels rendered
  expect(container.querySelectorAll('[class*="MuiTypography"]').length).toBeGreaterThanOrEqual(7);
});
