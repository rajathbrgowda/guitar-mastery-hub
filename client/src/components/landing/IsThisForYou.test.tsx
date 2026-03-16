import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import IsThisForYou from './IsThisForYou';

test('renders both columns', () => {
  render(<IsThisForYou />);
  expect(screen.getByText(/for you/i)).toBeInTheDocument();
  expect(screen.getByText(/probably not/i)).toBeInTheDocument();
});
