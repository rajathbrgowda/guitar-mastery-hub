import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';

interface Tool {
  name: string;
  description: string;
  url: string;
  category: 'learning' | 'tuning' | 'practice' | 'theory' | 'recording';
  platform: string;
  price: 'free' | 'freemium' | 'paid';
  rating: number; // out of 5
}

const TOOLS: Tool[] = [
  {
    name: 'JustinGuitar',
    description: 'The best free structured guitar course online. Grades 1–8, over 1000 lessons.',
    url: 'https://www.justinguitar.com',
    category: 'learning',
    platform: 'Web + App',
    price: 'free',
    rating: 5,
  },
  {
    name: 'Fender Play',
    description: 'Song-based video lessons for beginners. Good for motivation via songs you know.',
    url: 'https://www.fender.com/play',
    category: 'learning',
    platform: 'Web + App',
    price: 'freemium',
    rating: 4,
  },
  {
    name: 'Fender Tune',
    description: 'Best free chromatic tuner app. Accurate, fast, clean UI.',
    url: 'https://www.fender.com/tune',
    category: 'tuning',
    platform: 'iOS + Android',
    price: 'free',
    rating: 5,
  },
  {
    name: 'GuitarTuna',
    description: 'Popular tuner with chord library and metronome built in.',
    url: 'https://www.guitartuna.com',
    category: 'tuning',
    platform: 'iOS + Android',
    price: 'freemium',
    rating: 4,
  },
  {
    name: 'Metronome Online',
    description: 'No-install browser metronome. Simple and reliable.',
    url: 'https://www.metronome-online.com',
    category: 'practice',
    platform: 'Web',
    price: 'free',
    rating: 4,
  },
  {
    name: 'Soundslice',
    description: 'Interactive notation and tab viewer with audio sync. Great for transcription.',
    url: 'https://www.soundslice.com',
    category: 'practice',
    platform: 'Web',
    price: 'freemium',
    rating: 5,
  },
  {
    name: 'Ultimate Guitar',
    description:
      'Largest tab library online. Useful but varies in quality — verify against your ear.',
    url: 'https://www.ultimate-guitar.com',
    category: 'practice',
    platform: 'Web + App',
    price: 'freemium',
    rating: 4,
  },
  {
    name: 'musictheory.net',
    description: 'Free music theory lessons and exercises. Solid fundamentals for guitarists.',
    url: 'https://www.musictheory.net',
    category: 'theory',
    platform: 'Web',
    price: 'free',
    rating: 4,
  },
  {
    name: 'Tenuto',
    description: 'Music theory exercises app. Ear training, chord identification, note reading.',
    url: 'https://www.musictheory.net/products/tenuto',
    category: 'theory',
    platform: 'iOS',
    price: 'paid',
    rating: 4,
  },
  {
    name: 'GarageBand',
    description: 'Free recording DAW for Mac/iOS. Great for recording practice sessions.',
    url: 'https://www.apple.com/mac/garageband',
    category: 'recording',
    platform: 'Mac + iOS',
    price: 'free',
    rating: 5,
  },
  {
    name: 'Audacity',
    description: 'Free open-source audio recorder and editor. Cross-platform.',
    url: 'https://www.audacityteam.org',
    category: 'recording',
    platform: 'Mac + Windows + Linux',
    price: 'free',
    rating: 4,
  },
];

const CATEGORIES: { key: Tool['category']; label: string }[] = [
  { key: 'learning', label: 'Learning' },
  { key: 'tuning', label: 'Tuning' },
  { key: 'practice', label: 'Practice' },
  { key: 'theory', label: 'Theory' },
  { key: 'recording', label: 'Recording' },
];

const PRICE_COLOR: Record<Tool['price'], 'success' | 'warning' | 'error'> = {
  free: 'success',
  freemium: 'warning',
  paid: 'error',
};

function Stars({ rating }: { rating: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 0.25 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box
          key={i}
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: i <= rating ? 'primary.main' : '#e5e0df',
          }}
        />
      ))}
    </Box>
  );
}

export default function Tools() {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Tools
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Curated apps and platforms for learning, practicing, and recording guitar.
        </Typography>
      </Box>

      {CATEGORIES.map(({ key, label }) => {
        const items = TOOLS.filter((t) => t.category === key);
        return (
          <Box key={key} sx={{ mb: 4 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ mb: 1.5, display: 'block' }}
            >
              {label}
            </Typography>
            <Grid container spacing={2}>
              {items.map((tool) => (
                <Grid size={{ xs: 12, sm: 6 }} key={tool.name}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Box
                          component="a"
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            color: 'text.primary',
                            textDecoration: 'none',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          <Typography variant="body2" fontWeight={700}>
                            {tool.name}
                          </Typography>
                          <OpenInNewOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                        </Box>
                        <Stars rating={tool.rating} />
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 1.25, lineHeight: 1.5 }}
                      >
                        {tool.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                        <Chip
                          label={tool.price}
                          size="small"
                          color={PRICE_COLOR[tool.price]}
                          variant="outlined"
                          sx={{ height: 18, fontSize: '0.6rem' }}
                        />
                        <Chip
                          label={tool.platform}
                          size="small"
                          variant="outlined"
                          sx={{ height: 18, fontSize: '0.6rem' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
}
