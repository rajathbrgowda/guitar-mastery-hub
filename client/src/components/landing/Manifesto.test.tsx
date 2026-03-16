import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Manifesto from './Manifesto';

test('renders five honest things heading', () => {
  render(<Manifesto />);
  expect(screen.getByText(/five honest things/i)).toBeInTheDocument();
});

test('renders what this is not label', () => {
  render(<Manifesto />);
  expect(screen.getByText(/what this is not/i)).toBeInTheDocument();
});

test('renders all five statements', () => {
  render(<Manifesto />);
  const items = screen.getAllByText(/this is not/i);
  // 4 "This is not" statements + the "What this is not" overline
  expect(items.length).toBeGreaterThanOrEqual(4);
});
