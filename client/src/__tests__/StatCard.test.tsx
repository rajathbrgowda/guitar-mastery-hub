import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import StatCard from '../components/StatCard';

const theme = createTheme();

function renderStatCard(props: Parameters<typeof StatCard>[0]) {
  return render(
    <ThemeProvider theme={theme}>
      <StatCard {...props} />
    </ThemeProvider>
  );
}

describe('StatCard', () => {
  it('renders the label', () => {
    renderStatCard({ icon: null, label: 'Streak', value: '5d' });
    expect(screen.getByText('Streak')).toBeInTheDocument();
  });

  it('renders a string value', () => {
    renderStatCard({ icon: null, label: 'Streak', value: '5d' });
    expect(screen.getByText('5d')).toBeInTheDocument();
  });

  it('renders a numeric value', () => {
    renderStatCard({ icon: null, label: 'Sessions', value: 42 });
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows skeleton when loading', () => {
    const { container } = renderStatCard({ icon: null, label: 'Streak', value: '5d', loading: true });
    expect(container.querySelector('.MuiSkeleton-root')).toBeInTheDocument();
    expect(screen.queryByText('5d')).not.toBeInTheDocument();
  });
});
