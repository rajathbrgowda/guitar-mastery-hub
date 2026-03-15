import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ToolCard from '../components/ToolCard';
import type { Tool } from '@gmh/shared/types';

const theme = createTheme();

const BASE_TOOL: Tool = {
  key: 'justinguitar',
  name: 'JustinGuitar',
  url: 'https://www.justinguitar.com',
  description: 'Best free guitar course online.',
  category: 'learning',
  price: 'free',
  stars: 5,
  platform: 'Web + App',
  is_using: false,
};

function renderCard(tool: Tool, onToggle = vi.fn()) {
  return render(
    <ThemeProvider theme={theme}>
      <ToolCard tool={tool} onToggle={onToggle} />
    </ThemeProvider>,
  );
}

describe('ToolCard', () => {
  it('renders tool name and description', () => {
    renderCard(BASE_TOOL);
    expect(screen.getByText('JustinGuitar')).toBeInTheDocument();
    expect(screen.getByText('Best free guitar course online.')).toBeInTheDocument();
  });

  it('shows "I use this" button when not in toolkit', () => {
    renderCard(BASE_TOOL);
    expect(screen.getByRole('button', { name: /i use this/i })).toBeInTheDocument();
  });

  it('shows "In my toolkit" when is_using=true', () => {
    renderCard({ ...BASE_TOOL, is_using: true });
    expect(screen.getByRole('button', { name: /in my toolkit/i })).toBeInTheDocument();
  });

  it('calls onToggle when button clicked', () => {
    const onToggle = vi.fn();
    renderCard(BASE_TOOL, onToggle);
    fireEvent.click(screen.getByRole('button', { name: /i use this/i }));
    expect(onToggle).toHaveBeenCalledWith(BASE_TOOL);
  });

  it('renders Visit link pointing to correct URL', () => {
    renderCard(BASE_TOOL);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://www.justinguitar.com');
    expect(link).toHaveAttribute('target', '_blank');
  });
});
