import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import TheProblem from './TheProblem';

test('renders the problem narrative', () => {
  render(<TheProblem />);
  expect(screen.getByText(/the problem/i)).toBeInTheDocument();
});
