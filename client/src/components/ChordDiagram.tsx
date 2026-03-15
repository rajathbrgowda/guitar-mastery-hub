import { Box, Typography } from '@mui/material';

// Chord fingering data: [string (1-6, 1=high e), fret, finger?]
// fret 0 = open, fret -1 = muted
type ChordFingering = {
  positions: Array<{ string: number; fret: number }>; // fret 0 = open
  muted: number[]; // string numbers that are muted (X)
  barre?: { fret: number; fromString: number; toString: number };
  baseFret?: number; // for barre chords not at fret 1
};

const CHORD_DATA: Record<string, ChordFingering> = {
  Em: {
    positions: [
      { string: 5, fret: 2 },
      { string: 4, fret: 2 },
    ],
    muted: [],
  },
  Am: {
    positions: [
      { string: 4, fret: 2 },
      { string: 3, fret: 2 },
      { string: 2, fret: 1 },
    ],
    muted: [6],
  },
  D: {
    positions: [
      { string: 3, fret: 2 },
      { string: 2, fret: 3 },
      { string: 1, fret: 2 },
    ],
    muted: [6, 5],
  },
  G: {
    positions: [
      { string: 6, fret: 3 },
      { string: 5, fret: 2 },
      { string: 1, fret: 3 },
    ],
    muted: [],
  },
  C: {
    positions: [
      { string: 5, fret: 3 },
      { string: 4, fret: 2 },
      { string: 2, fret: 1 },
    ],
    muted: [6],
  },
  A: {
    positions: [
      { string: 4, fret: 2 },
      { string: 3, fret: 2 },
      { string: 2, fret: 2 },
    ],
    muted: [6],
  },
  E: {
    positions: [
      { string: 5, fret: 2 },
      { string: 4, fret: 2 },
      { string: 3, fret: 1 },
    ],
    muted: [],
  },
  F: { positions: [], muted: [], barre: { fret: 1, fromString: 1, toString: 6 } },
  Bm: {
    positions: [
      { string: 4, fret: 4 },
      { string: 3, fret: 4 },
      { string: 2, fret: 3 },
    ],
    muted: [6],
    barre: { fret: 2, fromString: 1, toString: 5 },
  },
};

const STRINGS = 6;
const FRETS = 4;
const STRING_SPACING = 18;
const FRET_SPACING = 16;
const MARGIN = { top: 20, left: 20, right: 12, bottom: 8 };

const W = MARGIN.left + (STRINGS - 1) * STRING_SPACING + MARGIN.right;
const H = MARGIN.top + FRETS * FRET_SPACING + MARGIN.bottom;

interface ChordDiagramProps {
  chordKey: string | null;
  size?: 'sm' | 'md';
}

export function ChordDiagram({ chordKey, size = 'md' }: ChordDiagramProps) {
  if (!chordKey) return null;

  const chord = CHORD_DATA[chordKey];
  if (!chord) return null;

  const scale = size === 'sm' ? 0.75 : 1;
  const scaledW = W * scale;
  const scaledH = H * scale;

  // Convert string number (1=high e, 6=low E) to x coordinate
  const sx = (s: number) => MARGIN.left + (STRINGS - s) * STRING_SPACING;
  // Convert fret number to y coordinate
  const fy = (f: number) => MARGIN.top + (f - 0.5) * FRET_SPACING;

  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
      <svg
        width={scaledW}
        height={scaledH}
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: 'block' }}
        aria-label={`${chordKey} chord diagram`}
      >
        {/* Nut (thick top line) */}
        <rect
          x={MARGIN.left}
          y={MARGIN.top - 4}
          width={(STRINGS - 1) * STRING_SPACING}
          height={4}
          fill="currentColor"
          opacity={0.8}
        />

        {/* Fret lines */}
        {Array.from({ length: FRETS + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={MARGIN.left}
            y1={MARGIN.top + i * FRET_SPACING}
            x2={MARGIN.left + (STRINGS - 1) * STRING_SPACING}
            y2={MARGIN.top + i * FRET_SPACING}
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: STRINGS }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={MARGIN.left + i * STRING_SPACING}
            y1={MARGIN.top}
            x2={MARGIN.left + i * STRING_SPACING}
            y2={MARGIN.top + FRETS * FRET_SPACING}
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={1}
          />
        ))}

        {/* Muted strings (X) */}
        {chord.muted.map((s) => (
          <text
            key={`muted-${s}`}
            x={sx(s)}
            y={MARGIN.top - 6}
            textAnchor="middle"
            fontSize={10}
            fill="currentColor"
            opacity={0.6}
          >
            ×
          </text>
        ))}

        {/* Open strings (O) — any un-fretted, un-muted string */}
        {Array.from({ length: STRINGS }, (_, i) => i + 1)
          .filter((s) => {
            const fretted = chord.positions.some((p) => p.string === s);
            const muted = chord.muted.includes(s);
            const barred = chord.barre && s >= chord.barre.fromString && s <= chord.barre.toString;
            return !fretted && !muted && !barred;
          })
          .map((s) => (
            <text
              key={`open-${s}`}
              x={sx(s)}
              y={MARGIN.top - 6}
              textAnchor="middle"
              fontSize={9}
              fill="currentColor"
              opacity={0.5}
            >
              ○
            </text>
          ))}

        {/* Barre */}
        {chord.barre && (
          <rect
            x={sx(chord.barre.toString)}
            y={fy(chord.barre.fret) - 5}
            width={(chord.barre.toString - chord.barre.fromString) * STRING_SPACING}
            height={10}
            rx={5}
            fill="var(--mui-palette-primary-main, #7c3aed)"
          />
        )}

        {/* Finger positions */}
        {chord.positions.map((pos) => (
          <circle
            key={`pos-${pos.string}-${pos.fret}`}
            cx={sx(pos.string)}
            cy={fy(pos.fret)}
            r={6}
            fill="var(--mui-palette-primary-main, #7c3aed)"
          />
        ))}
      </svg>

      <Typography
        variant="caption"
        fontWeight={700}
        sx={{ fontSize: '0.65rem', opacity: 0.7, letterSpacing: 1 }}
      >
        {chordKey}
      </Typography>
    </Box>
  );
}
