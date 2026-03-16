import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ResourceCard } from '../components/ResourceCard';
import type { ResourceWithCompletion } from '@gmh/shared/types/resources';

const theme = createTheme();

const base: ResourceWithCompletion = {
  id: 'r1',
  title: 'Justin Guitar Beginner Course',
  url: 'https://www.justinguitar.com',
  type: 'video',
  phase_index: 1,
  is_featured: true,
  description: 'Free beginner guitar lessons',
  completion: 0,
  status: 'not_started',
  is_recommended: false,
};

describe('ResourceCard', () => {
  it('renders resource title', () => {
    render(
      <ThemeProvider theme={theme}>
        <ResourceCard resource={base} onMarkComplete={vi.fn()} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Justin Guitar Beginner Course')).toBeTruthy();
  });

  it('shows type chip', () => {
    render(
      <ThemeProvider theme={theme}>
        <ResourceCard resource={base} onMarkComplete={vi.fn()} />
      </ThemeProvider>,
    );
    expect(screen.getByText('video')).toBeTruthy();
  });

  it('shows completed status chip when status=completed', () => {
    render(
      <ThemeProvider theme={theme}>
        <ResourceCard
          resource={{ ...base, status: 'completed', completion: 100 }}
          onMarkComplete={vi.fn()}
        />
      </ThemeProvider>,
    );
    expect(screen.getByText('Completed')).toBeTruthy();
  });

  it('calls onMarkComplete when Mark complete clicked', () => {
    const fn = vi.fn();
    render(
      <ThemeProvider theme={theme}>
        <ResourceCard resource={base} onMarkComplete={fn} />
      </ThemeProvider>,
    );
    screen.getByText('Mark complete').click();
    expect(fn).toHaveBeenCalledWith('r1');
  });

  it('does not render open-link button when url is null', () => {
    render(
      <ThemeProvider theme={theme}>
        <ResourceCard resource={{ ...base, url: null }} onMarkComplete={vi.fn()} />
      </ThemeProvider>,
    );
    expect(screen.queryByLabelText('Open resource')).toBeNull();
  });

  it('renders open-link button when url is present', () => {
    render(
      <ThemeProvider theme={theme}>
        <ResourceCard resource={base} onMarkComplete={vi.fn()} />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText('Open resource')).toBeTruthy();
  });
});
