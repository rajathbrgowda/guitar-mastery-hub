import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import type { SkillAnalytics } from '@gmh/shared/types/analytics';

const DOT_COLORS: Record<number, string> = {
  1: '#ef4444', // red — hard
  2: '#f59e0b', // amber — okay
  3: '#22c55e', // green — easy
};

function trendArrow(ratings: number[]) {
  if (ratings.length < 2) return null;
  const first2 = ratings.slice(0, 2).reduce((s, r) => s + r, 0) / 2;
  const last2 = ratings.slice(-2).reduce((s, r) => s + r, 0) / 2;
  const diff = last2 - first2;
  if (diff > 0.3) return <TrendingUpIcon sx={{ fontSize: 14, color: '#22c55e' }} />;
  if (diff < -0.3) return <TrendingDownIcon sx={{ fontSize: 14, color: '#ef4444' }} />;
  return <TrendingFlatIcon sx={{ fontSize: 14, color: 'text.disabled' }} />;
}

interface ConfidenceTrendListProps {
  skills: SkillAnalytics[];
}

export function ConfidenceTrendList({ skills }: ConfidenceTrendListProps) {
  const rated = skills
    .filter((s) => s.last_5_ratings.length > 0)
    .sort((a, b) => (a.avg_confidence ?? 3) - (b.avg_confidence ?? 3));

  if (rated.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        Rate skills during practice to see trends
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {rated.map((skill) => {
        // Pad to 5 dots with nulls at the front
        const padded = Array(Math.max(0, 5 - skill.last_5_ratings.length))
          .fill(null)
          .concat(skill.last_5_ratings);

        return (
          <Box key={skill.skill_id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="caption"
              sx={{
                flex: 1,
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {skill.skill_title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
              {padded.map((r, i) => (
                <Box
                  key={i}
                  data-testid="confidence-dot"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: r != null ? DOT_COLORS[r as number] : 'action.disabled',
                  }}
                />
              ))}
            </Box>
            {trendArrow(skill.last_5_ratings)}
          </Box>
        );
      })}
    </Box>
  );
}
