import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Demo must NOT call api at all
vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(() => { throw new Error('api.get called in demo mode — should never happen'); }),
    post: vi.fn(() => { throw new Error('api.post called in demo mode — should never happen'); }),
  },
}));

// No auth context needed — Demo is public
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ session: null, loading: false }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

import Demo from '../pages/Demo';

const theme = createTheme();

function renderDemo() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Demo />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('Demo', () => {
  it('renders without crashing (no auth required)', () => {
    renderDemo();
    expect(document.body).toBeTruthy();
  });

  it('shows demo banner text', () => {
    renderDemo();
    expect(screen.getByText(/you are viewing a demo/i)).toBeInTheDocument();
  });

  it('shows sign up CTA in banner', () => {
    renderDemo();
    expect(screen.getAllByRole('button', { name: /sign up free/i })[0]).toBeInTheDocument();
  });

  it('shows streak stat', () => {
    renderDemo();
    expect(screen.getByText(/14 days/i)).toBeInTheDocument();
  });

  it('shows recent sessions', () => {
    renderDemo();
    expect(screen.getByText(/recent sessions/i)).toBeInTheDocument();
  });

  it('shows phase progress section', () => {
    renderDemo();
    expect(screen.getAllByText(/beginner/i)[0]).toBeInTheDocument();
  });

  it('does not call api.get', async () => {
    const { default: api } = await import('../services/api');
    const apiMock = vi.mocked(api);
    renderDemo();
    expect(apiMock.get).not.toHaveBeenCalled();
  });
});
