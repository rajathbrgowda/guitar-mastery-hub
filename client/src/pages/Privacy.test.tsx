import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Privacy from './Privacy';

test('renders privacy policy heading', () => {
  render(
    <MemoryRouter>
      <Privacy />
    </MemoryRouter>,
  );
  expect(screen.getByText(/privacy policy/i)).toBeInTheDocument();
});
