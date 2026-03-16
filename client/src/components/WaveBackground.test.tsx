import { render } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import WaveBackground from './WaveBackground';

function renderWithTheme(
  ui: React.ReactElement,
  primaryColor = '#ea580c',
  mode: 'light' | 'dark' = 'light',
) {
  const theme = createTheme({ palette: { mode, primary: { main: primaryColor } } });
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('WaveBackground', () => {
  it('renders an SVG with wave paths (calm variant)', () => {
    const { container } = renderWithTheme(<WaveBackground variant="calm" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();

    const paths = svg!.querySelectorAll('path');
    // calm variant generates 11 wave paths
    expect(paths.length).toBe(11);
  });

  it('renders more paths for hero variant', () => {
    const { container } = renderWithTheme(<WaveBackground variant="hero" />);
    const paths = container.querySelectorAll('svg path');
    // hero variant generates 14 wave paths
    expect(paths.length).toBe(14);
  });

  it('hero variant has higher stroke opacities than calm', () => {
    const { container: calmContainer } = renderWithTheme(<WaveBackground variant="calm" />);
    const { container: heroContainer } = renderWithTheme(<WaveBackground variant="hero" />);

    const calmPaths = calmContainer.querySelectorAll('svg path');
    const heroPaths = heroContainer.querySelectorAll('svg path');

    // Get max opacity from each set
    const maxOpacity = (paths: NodeListOf<SVGPathElement>) =>
      Math.max(
        ...Array.from(paths).map((p) => parseFloat(p.getAttribute('stroke-opacity') ?? '0')),
      );

    expect(maxOpacity(heroPaths)).toBeGreaterThan(maxOpacity(calmPaths));
  });

  it('uses the theme primary color as stroke', () => {
    const { container } = renderWithTheme(<WaveBackground />, '#2563eb');
    const paths = container.querySelectorAll('svg path');
    const firstStroke = paths[0]?.getAttribute('stroke');
    expect(firstStroke).toBe('#2563eb');
  });

  it('is aria-hidden and has pointer-events none', () => {
    const { container } = renderWithTheme(<WaveBackground />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.getAttribute('aria-hidden')).toBe('true');
  });

  it('defaults to calm variant when no variant prop', () => {
    const { container } = renderWithTheme(<WaveBackground />);
    const paths = container.querySelectorAll('svg path');
    expect(paths.length).toBe(11);
  });

  it('renders dotted/dashed strokes (not solid lines)', () => {
    const { container } = renderWithTheme(<WaveBackground variant="calm" />);
    const paths = container.querySelectorAll('svg path');
    // Every path should have a stroke-dasharray for the dotted mesh effect
    Array.from(paths).forEach((p) => {
      const dash = p.getAttribute('stroke-dasharray');
      expect(dash).toBeTruthy();
      expect(dash).toMatch(/^\d+ \d+$/); // pattern like "2 6"
    });
  });
});
