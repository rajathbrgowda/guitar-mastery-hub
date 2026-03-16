import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Terms from './Terms';

test('renders terms of use heading', () => {
  render(
    <MemoryRouter>
      <Terms />
    </MemoryRouter>,
  );
  expect(screen.getByText(/terms of use/i)).toBeInTheDocument();
});
