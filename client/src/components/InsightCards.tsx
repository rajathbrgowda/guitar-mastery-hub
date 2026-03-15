import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import type { InsightCard } from '@gmh/shared/types/analytics';

const ICONS: Record<string, React.ReactNode> = {
  best_day: <CalendarTodayIcon sx={{ fontSize: 20, color: 'primary.main' }} />,
  most_practiced: <MusicNoteIcon sx={{ fontSize: 20, color: 'primary.main' }} />,
  consistency: <TrendingUpIcon sx={{ fontSize: 20, color: 'primary.main' }} />,
  milestone: <EmojiEventsIcon sx={{ fontSize: 20, color: 'warning.main' }} />,
};

interface InsightCardsProps {
  cards: InsightCard[];
}

export function InsightCards({ cards }: InsightCardsProps) {
  if (cards.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Practice a few sessions to unlock insights.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {cards.map((card) => (
        <Card key={card.type} variant="outlined" sx={{ borderRadius: 2 }}>
          <CardContent sx={{ py: '12px !important', px: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ mt: 0.25 }}>
                {ICONS[card.type] ?? (
                  <TrendingUpIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                )}
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}
                >
                  {card.title}
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {card.body}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
