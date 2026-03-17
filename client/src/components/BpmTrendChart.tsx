import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
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
import { api } from '../services/api';
import type { BpmHistoryResponse } from '@gmh/shared/types/bpm';

interface BpmTrendChartProps {
  techniqueSkillKeys: string[]; // skill keys that have category 'technique'
}

export function BpmTrendChart({ techniqueSkillKeys }: BpmTrendChartProps) {
  const theme = useTheme();
  const [selectedKey, setSelectedKey] = useState(techniqueSkillKeys[0] ?? '');
  const [data, setData] = useState<BpmHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedKey) return;
    setLoading(true);
    api
      .get<BpmHistoryResponse>(`/api/analytics/bpm?skill_key=${selectedKey}`)
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [selectedKey]);

  if (techniqueSkillKeys.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Log BPM on technique skills during practice to see your speed progress here.
      </Typography>
    );
  }

  const chartData = (data?.logs ?? []).map((l) => ({
    date: new Date(l.logged_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    bpm: l.bpm,
  }));

  return (
    <Box>
      {techniqueSkillKeys.length > 1 && (
        <TextField
          select
          size="small"
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          sx={{ mb: 1.5, minWidth: 180 }}
        >
          {techniqueSkillKeys.map((key) => (
            <MenuItem key={key} value={key}>
              {key.replace(/_/g, ' ')}
            </MenuItem>
          ))}
        </TextField>
      )}

      {loading ? (
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
      ) : chartData.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No BPM data yet for this skill. Log your speed during practice.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: theme.palette.text.disabled }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: theme.palette.text.disabled }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                fontSize: '0.75rem',
                borderRadius: 6,
                border: `1px solid ${theme.palette.divider}`,
              }}
            />
            {data?.max_bpm && (
              <ReferenceLine
                y={data.max_bpm}
                stroke={theme.palette.success.main}
                strokeDasharray="4 4"
                label={{
                  value: `PB: ${data.max_bpm}`,
                  position: 'right',
                  fontSize: 10,
                  fill: theme.palette.success.main,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="bpm"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Box>
  );
}
