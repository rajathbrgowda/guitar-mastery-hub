import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HowItWorks from './HowItWorks';

test('renders 3 steps', () => {
  render(
    <MemoryRouter>
      <HowItWorks />
    </MemoryRouter>,
  );
  expect(screen.getByText('01')).toBeInTheDocument();
  expect(screen.getByText('02')).toBeInTheDocument();
  expect(screen.getByText('03')).toBeInTheDocument();
});
