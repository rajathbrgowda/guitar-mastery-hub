import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import BeforeAfter from './BeforeAfter';

test('renders without-log and with-log labels', () => {
  render(<BeforeAfter />);
  const withoutLog = screen.getAllByText(/without a log/i);
  const withLog = screen.getAllByText(/with a log/i);
  expect(withoutLog.length).toBeGreaterThanOrEqual(1);
  expect(withLog.length).toBeGreaterThanOrEqual(1);
});

test('renders heading', () => {
  render(<BeforeAfter />);
  expect(screen.getByText(/the difference is the record/i)).toBeInTheDocument();
});
