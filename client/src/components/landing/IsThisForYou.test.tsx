import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IsThisForYou from './IsThisForYou';

test('renders both columns', () => {
  render(<IsThisForYou />);
  expect(screen.getAllByText(/for you/i).length).toBeGreaterThanOrEqual(1);
  expect(screen.getByText(/probably not/i)).toBeInTheDocument();
});
