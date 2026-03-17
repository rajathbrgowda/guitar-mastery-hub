import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useTheme } from '@mui/material/styles';
import { api } from '../services/api';
import type { ConfidenceTrendsResponse } from '@gmh/shared/types/bpm';

const CONFIDENCE_LABELS: Record<number, string> = { 1: 'Hard', 2: 'Okay', 3: 'Easy' };
const LINE_COLORS = ['#ea580c', '#2563eb', '#16a34a', '#7c3aed', '#e11d48', '#d97706'];

export function ConfidenceTrendChart() {
  const theme = useTheme();
  const [data, setData] = useState<ConfidenceTrendsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ConfidenceTrendsResponse>('/api/analytics/confidence-trends')
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />;

  if (!data || data.skills.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Rate your confidence during practice to see trends here.
      </Typography>
    );
  }

  const dateSet = new Set<string>();
  for (const skill of data.skills) {
    for (const r of skill.ratings) dateSet.add(r.date);
  }
  const sortedDates = [...dateSet].sort();

  const chartData = sortedDates.map((date) => {
    const row: Record<string, string | number> = {
      date: new Date(date + 'T00:00:00').toLocaleDateString('en', {
        month: 'short',
        day: 'numeric',
      }),
    };
    for (const skill of data.skills) {
      const match = skill.ratings.find((r) => r.date === date);
      if (match) row[skill.skill_title] = match.confidence;
    }
    return row;
  });

  const visibleSkills = data.skills.slice(0, 6);

  return (
    <Box>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: theme.palette.text.disabled }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0.5, 3.5]}
            ticks={[1, 2, 3]}
            tickFormatter={(v) => CONFIDENCE_LABELS[v] ?? ''}
            tick={{ fontSize: 9, fill: theme.palette.text.disabled }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: '0.75rem',
              borderRadius: 6,
              border: `1px solid ${theme.palette.divider}`,
            }}
            formatter={(v) => [CONFIDENCE_LABELS[Number(v)] ?? v, '']}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: '0.65rem', paddingTop: 8 }} />
          {visibleSkills.map((skill, i) => (
            <Line
              key={skill.skill_key}
              type="monotone"
              dataKey={skill.skill_title}
              stroke={LINE_COLORS[i % LINE_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {data.skills.length > 6 && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
          + {data.skills.length - 6} more skills not shown
        </Typography>
      )}
    </Box>
  );
}
