import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import type { ConfidenceTrendPoint } from '@gmh/shared/types/analytics';

interface ConfidenceTrendChartProps {
  data: ConfidenceTrendPoint[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const LABELS: Record<number, string> = { 1: 'Hard', 2: 'Okay', 3: 'Easy' };
  const val = payload[0].value as number;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        px: 1.5,
        py: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {format(parseISO(label), 'MMM d')}
      </Typography>
      <Typography
        sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: '0.85rem' }}
      >
        {val.toFixed(1)} — {LABELS[Math.round(val)] ?? ''}
      </Typography>
    </Box>
  );
}

export function ConfidenceTrendChart({ data }: ConfidenceTrendChartProps) {
  const theme = useTheme();

  if (data.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        Rate skills during practice to see your confidence trend.
      </Typography>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="date"
          tick={{ fontSize: 10, fill: '#5c5858' }}
          tickFormatter={(d) => format(parseISO(d), 'MMM d')}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[1, 3]}
          ticks={[1, 2, 3]}
          tick={{ fontSize: 10, fill: '#5c5858' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => ['', 'Hard', 'Okay', 'Easy'][v] ?? ''}
        />
        <ReferenceLine y={2} stroke={theme.palette.divider} strokeDasharray="4 2" />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="avg_confidence"
          stroke={theme.palette.primary.main}
          strokeWidth={2}
          dot={{ r: 3, fill: theme.palette.primary.main }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
