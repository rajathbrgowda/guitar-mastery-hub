import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TypicalTuesday from './TypicalTuesday';

test('renders before and after panels', () => {
  render(<TypicalTuesday />);
  expect(screen.getByText(/before/i)).toBeInTheDocument();
  expect(screen.getByText(/after/i)).toBeInTheDocument();
});
