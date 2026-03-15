import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import MyToolkitSection from '../components/MyToolkitSection';
import type { Tool } from '@gmh/shared/types';

const theme = createTheme();

function makeTool(key: string, name: string): Tool {
  return {
    key,
    name,
    url: `https://${key}.com`,
    description: 'Test tool',
    category: 'learning',
    price: 'free',
    stars: 4,
    platform: 'Web',
    is_using: true,
  };
}

function renderSection(tools: Tool[]) {
  return render(
    <ThemeProvider theme={theme}>
      <MyToolkitSection tools={tools} />
    </ThemeProvider>,
  );
}

describe('MyToolkitSection', () => {
  it('shows empty state message when no tools', () => {
    renderSection([]);
    expect(screen.getByText(/mark tools you use below/i)).toBeInTheDocument();
  });

  it('renders tool names when tools provided', () => {
    renderSection([makeTool('justinguitar', 'JustinGuitar')]);
    expect(screen.getByText('JustinGuitar')).toBeInTheDocument();
  });

  it('shows "and N more" when tools exceed 5', () => {
    const tools = Array.from({ length: 7 }, (_, i) => makeTool(`tool-${i}`, `Tool ${i}`));
    renderSection(tools);
    expect(screen.getByText(/and 2 more/i)).toBeInTheDocument();
  });

  it('shows tool count in header', () => {
    renderSection([
      makeTool('justinguitar', 'JustinGuitar'),
      makeTool('fender-tune', 'Fender Tune'),
    ]);
    expect(screen.getByText('2 tools')).toBeInTheDocument();
  });
});
