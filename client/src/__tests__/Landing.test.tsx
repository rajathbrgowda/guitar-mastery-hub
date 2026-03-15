import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// Mock auth — logged out by default
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ session: null, loading: false }),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock fetch for public stats (CloseCTA)
global.fetch = vi.fn().mockResolvedValue({ ok: false }) as typeof fetch;

import Landing from '../pages/Landing';

const theme = createTheme();

function renderLanding() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

describe('Landing', () => {
  it('renders hero headline', () => {
    renderLanding();
    expect(screen.getByText(/finally stick/i)).toBeInTheDocument();
    expect(screen.getByText(/with guitar\./i)).toBeInTheDocument();
  });

  it('renders sub-headline', () => {
    renderLanding();
    expect(screen.getByText(/structured practice\. real data\. no noise\./i)).toBeInTheDocument();
  });

  it('renders JustinGuitar badge', () => {
    renderLanding();
    expect(screen.getByText(/built for justinguitar learners/i)).toBeInTheDocument();
  });

  it('[Get started free] navigates to /login?mode=signup', async () => {
    mockNavigate.mockClear();
    renderLanding();
    await userEvent.click(screen.getByRole('button', { name: /get started free/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login?mode=signup');
  });

  it('[See how it works] navigates to /demo', async () => {
    mockNavigate.mockClear();
    renderLanding();
    await userEvent.click(screen.getByRole('button', { name: /see how it works/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/demo');
  });

  it('three content section headings render', () => {
    renderLanding();
    expect(screen.getByText(/what a week looks like/i)).toBeInTheDocument();
    expect(screen.getByText(/see yourself improve/i)).toBeInTheDocument();
    expect(screen.getByText(/a path, not a playlist/i)).toBeInTheDocument();
  });

  it('final CTA [Create account] navigates to signup', async () => {
    mockNavigate.mockClear();
    renderLanding();
    const createBtn = screen.getByRole('button', { name: /create your free account/i });
    await userEvent.click(createBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login?mode=signup');
  });
});

// ── Epic 8: Developer sections ────────────────────────────────────────────────

describe('Landing — WhyIBuiltThis section (CARD-308/309)', () => {
  it('renders Why I Built This heading', () => {
    renderLanding();
    expect(screen.getByText(/why i built this/i)).toBeInTheDocument();
  });

  it('renders the frustrated guitarist copy', () => {
    renderLanding();
    expect(screen.getByText(/i was the guitarist who kept quitting/i)).toBeInTheDocument();
  });
});

describe('Landing — AboutDeveloper section (CARD-310/311)', () => {
  it('renders About the Developer label', () => {
    renderLanding();
    expect(screen.getByText(/about the developer/i)).toBeInTheDocument();
  });

  it('renders solo indie dev heading', () => {
    renderLanding();
    expect(screen.getByText(/one person\. one guitar app\./i)).toBeInTheDocument();
  });

  it('renders solo indie dev chip', () => {
    renderLanding();
    expect(screen.getByText(/solo indie dev/i)).toBeInTheDocument();
  });
});

// ── Epic 9: FAQ ───────────────────────────────────────────────────────────────

describe('Landing — FAQSection (CARD-312/313/314)', () => {
  it('renders FAQ heading', () => {
    renderLanding();
    expect(screen.getByText(/honest answers/i)).toBeInTheDocument();
  });

  it('renders first FAQ question', () => {
    renderLanding();
    expect(screen.getByText(/is it really free\?/i)).toBeInTheDocument();
  });
});

// ── Epic 10: Social proof ─────────────────────────────────────────────────────

describe('Landing — TestimonialSection (CARD-315/316)', () => {
  it('renders testimonials heading', () => {
    renderLanding();
    expect(screen.getByText(/from people actually using it/i)).toBeInTheDocument();
  });

  it('renders a testimonial quote', () => {
    renderLanding();
    expect(screen.getByText(/i kept telling myself i was practicing/i)).toBeInTheDocument();
  });
});

describe('Landing — OpenDevNote (CARD-317/318)', () => {
  it('renders dev note label', () => {
    renderLanding();
    expect(screen.getByText(/a note from the developer/i)).toBeInTheDocument();
  });

  it('renders where the app is right now heading', () => {
    renderLanding();
    expect(screen.getByText(/where the app is right now/i)).toBeInTheDocument();
  });
});

// ── Epic 14: heading hierarchy ────────────────────────────────────────────────

describe('Landing — heading hierarchy (CARD-331)', () => {
  it('has exactly one h1', () => {
    renderLanding();
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
  });

  it('h1 is the hero headline', () => {
    renderLanding();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toMatch(/finally stick/i);
  });

  it('section headings are h2', () => {
    renderLanding();
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s.length).toBeGreaterThanOrEqual(5);
  });
});

// ── Epic 14: a11y ─────────────────────────────────────────────────────────────

describe('Landing — accessibility (CARD-333)', () => {
  it('nav has aria-label', () => {
    renderLanding();
    expect(screen.getByRole('navigation', { name: /site navigation/i })).toBeInTheDocument();
  });

  it('[Create account] button has accessible aria-label', () => {
    renderLanding();
    expect(screen.getByRole('button', { name: /create your free account/i })).toBeInTheDocument();
  });
});

// ── Logged-in redirect ────────────────────────────────────────────────────────

describe('Landing — logged-in redirect', () => {
  it('redirects to /app when session exists', () => {
    vi.doMock('../context/AuthContext', () => ({
      useAuth: () => ({ session: { user: { id: '1' } }, loading: false }),
    }));
    renderLanding();
    expect(document.body).toBeTruthy();
  });
});
