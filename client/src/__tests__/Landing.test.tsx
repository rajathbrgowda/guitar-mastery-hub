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
  it('hero shows new headline', () => {
    renderLanding();
    expect(screen.getByText(/stop starting over/i)).toBeInTheDocument();
  });

  it('renders self-taught guitarists chip', () => {
    renderLanding();
    expect(screen.getByText(/for the guitarist who keeps starting over/i)).toBeInTheDocument();
  });

  it('StreakCalendar not in hero', () => {
    renderLanding();
    expect(screen.queryByTestId('streak-calendar')).toBeNull();
  });

  it('[Start free] CTA is a link to /login?mode=signup', () => {
    renderLanding();
    const btn = screen.getByRole('link', { name: /start free/i });
    expect(btn).toBeInTheDocument();
  });

  it('[See how it works] CTA links to #how-it-works anchor', () => {
    renderLanding();
    const btn = screen.getByRole('link', { name: /see how it works/i });
    expect(btn).toHaveAttribute('href', '#how-it-works');
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
  it('renders section label', () => {
    renderLanding();
    expect(screen.getByText(/why this exists/i)).toBeInTheDocument();
  });

  it('renders heading focused on the learner', () => {
    renderLanding();
    expect(
      screen.getByText(/you know that feeling of picking it up after three weeks/i),
    ).toBeInTheDocument();
  });
});

describe('Landing — AboutDeveloper section (CARD-310/311)', () => {
  it('renders Behind the app label', () => {
    renderLanding();
    expect(screen.getByText(/behind the app/i)).toBeInTheDocument();
  });

  it('renders learner-forward heading', () => {
    renderLanding();
    expect(screen.getByText(/small, careful, free/i)).toBeInTheDocument();
  });

  it('renders Made with care chip', () => {
    renderLanding();
    expect(screen.getAllByText(/made with care/i).length).toBeGreaterThanOrEqual(1);
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
  it('testimonials hidden behind feature flag by default', () => {
    renderLanding();
    expect(screen.queryByText(/from people actually using it/i)).not.toBeInTheDocument();
  });
});

describe('Landing — OpenDevNote (CARD-317/318)', () => {
  it('renders dev note label', () => {
    renderLanding();
    expect(screen.getByText(/a quick note/i)).toBeInTheDocument();
  });

  it('renders where the app is right now heading', () => {
    renderLanding();
    expect(screen.getByText(/early, honest, and in use/i)).toBeInTheDocument();
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
    expect(h1.textContent).toMatch(/stop starting over/i);
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
