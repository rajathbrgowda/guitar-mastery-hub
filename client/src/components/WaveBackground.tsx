import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { useMemo } from 'react';

type WaveVariant = 'calm' | 'hero';

interface WaveBackgroundProps {
  variant?: WaveVariant;
}

// ── Wave path generator ──────────────────────────────────────────────────────
// Builds a cubic-bezier wave path across the full viewBox width.
// Each wave has a unique vertical offset, amplitude, and phase shift
// to create a natural, organic mesh feel.

interface WaveConfig {
  yBase: number;
  amplitude: number;
  phaseShift: number;
  strokeOpacity: number;
  strokeWidth: number;
  dashArray: string; // dotted mesh pattern — varies per line for organic feel
}

const VIEW_W = 1440;
const VIEW_H = 900;
const SEGMENTS = 6; // number of horizontal bezier segments per wave

function buildWavePath(cfg: WaveConfig): string {
  const { yBase, amplitude, phaseShift } = cfg;
  const segW = VIEW_W / SEGMENTS;
  let d = `M0,${yBase + Math.sin(phaseShift) * amplitude}`;

  for (let i = 0; i < SEGMENTS; i++) {
    const x0 = i * segW;
    const x1 = (i + 1) * segW;
    const xMid = (x0 + x1) / 2;
    const y0 = yBase + Math.sin(phaseShift + (i / SEGMENTS) * Math.PI * 2) * amplitude;
    const y1 = yBase + Math.sin(phaseShift + ((i + 1) / SEGMENTS) * Math.PI * 2) * amplitude;
    const cp1y = y0 + amplitude * Math.cos(phaseShift + (i / SEGMENTS) * Math.PI * 2) * 0.6;
    const cp2y = y1 - amplitude * Math.cos(phaseShift + ((i + 1) / SEGMENTS) * Math.PI * 2) * 0.6;
    d += ` C${xMid},${cp1y} ${xMid},${cp2y} ${x1},${y1}`;
  }

  return d;
}

// ── Presets per variant ──────────────────────────────────────────────────────

// Dash patterns — small dot+gap combos for the fine mesh/dotted look.
// Varying per line so the mesh feels organic, not uniform.
const DASH_PATTERNS = [
  '2 6', // fine dots, wide gap
  '3 5', // slightly longer dots
  '1 4', // tiny dots, tight
  '4 7', // medium dashes
  '2 5', // fine dots
  '3 8', // sparse dashes
  '1 5', // tiny dots, wider
  '2 7', // fine dots, wide
  '3 6', // medium
  '4 8', // longer dashes, sparse
  '2 4', // tighter dots
  '1 6', // tiny, sparse
  '3 7', // medium-sparse
  '2 8', // fine, very sparse
];

function generateWaves(variant: WaveVariant, isDark: boolean): WaveConfig[] {
  const isHero = variant === 'hero';
  const count = isHero ? 14 : 11;

  // Much lighter opacities — background should whisper, not compete with content
  const opMin = isHero ? 0.05 : 0.03;
  const opMax = isHero ? 0.14 : 0.09;
  // Slight bump in dark mode for visibility against dark backgrounds
  const darkBoost = isDark ? 0.02 : 0;

  const waves: WaveConfig[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1); // 0..1
    waves.push({
      yBase: 200 + t * 500, // spread across middle 200..700 of 900h viewBox
      amplitude: 30 + Math.sin(i * 1.3) * 25 + t * 20,
      phaseShift: i * 0.9 + t * 2,
      strokeOpacity: Math.min(opMin + t * (opMax - opMin) + darkBoost, 0.18),
      strokeWidth: 0.5 + Math.sin(i * 0.7) * 0.3 + t * 0.4,
      dashArray: DASH_PATTERNS[i % DASH_PATTERNS.length],
    });
  }
  return waves;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function WaveBackground({ variant = 'calm' }: WaveBackgroundProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const primary = theme.palette.primary.main;

  const waves = useMemo(() => generateWaves(variant, isDark), [variant, isDark]);
  const paths = useMemo(() => waves.map((w) => buildWavePath(w)), [waves]);

  // Gradient wash — subtle radial glow from top-left using accent color
  const washOpacity = isDark ? 0.06 : 0.04;
  const washColor = alpha(primary, washOpacity);

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="wave-wash" cx="20%" cy="30%" r="80%">
            <stop offset="0%" stopColor={washColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Gradient wash layer */}
        <rect width={VIEW_W} height={VIEW_H} fill="url(#wave-wash)" />

        {/* Wave paths */}
        {waves.map((w, i) => (
          <path
            key={i}
            d={paths[i]}
            fill="none"
            stroke={primary}
            strokeOpacity={w.strokeOpacity}
            strokeWidth={w.strokeWidth}
            strokeDasharray={w.dashArray}
            strokeLinecap="round"
          />
        ))}
      </svg>
    </Box>
  );
}
