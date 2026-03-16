import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { useToolsStore } from '../store/toolsStore';
import { useUserStore } from '../store/userStore';
import type { Tool, ToolCategory } from '@gmh/shared/types';
import ToolCard from '../components/ToolCard';
import MyToolkitSection from '../components/MyToolkitSection';
import PhaseToolRecommendation from '../components/PhaseToolRecommendation';

const CATEGORIES: { key: ToolCategory | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'learning', label: 'Learning' },
  { key: 'tuning', label: 'Tuning' },
  { key: 'practice', label: 'Practice' },
  { key: 'theory', label: 'Theory' },
  { key: 'recording', label: 'Recording' },
];

const PRICES: { key: 'all' | 'free' | 'freemium' | 'paid'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'free', label: 'Free' },
  { key: 'freemium', label: 'Freemium' },
  { key: 'paid', label: 'Paid' },
];

function ToolSkeleton() {
  return (
    <Card sx={{ height: 170 }}>
      <Box sx={{ p: 2 }}>
        <Skeleton width={120} height={20} sx={{ mb: 1 }} />
        <Skeleton width="100%" height={14} />
        <Skeleton width="80%" height={14} sx={{ mb: 1.5 }} />
        <Skeleton width={80} height={22} sx={{ mb: 1.5, borderRadius: 4 }} />
        <Skeleton variant="rectangular" height={30} sx={{ borderRadius: 1 }} />
      </Box>
    </Card>
  );
}

export default function Tools() {
  const { all, my_toolkit, recommended, isLoading, error, fetchTools, addTool, removeTool } =
    useToolsStore();
  const { profile } = useUserStore();
  const [toggling, setToggling] = useState<string | null>(null);
  const [categoryTab, setCategoryTab] = useState<ToolCategory | 'all'>('all');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'freemium' | 'paid'>('all');

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  async function handleToggle(tool: Tool) {
    setToggling(tool.key);
    try {
      if (tool.is_using) {
        await removeTool(tool.key);
      } else {
        await addTool(tool.key);
      }
    } finally {
      setToggling(null);
    }
  }

  const filtered = all.filter((t) => {
    if (categoryTab !== 'all' && t.category !== categoryTab) return false;
    if (priceFilter !== 'all' && t.price !== priceFilter) return false;
    return true;
  });

  const currentPhase = profile?.current_phase ?? 1;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          gutterBottom
          sx={{ fontSize: { xs: '1.4rem', sm: '2.125rem' } }}
        >
          Tools
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Curated apps and platforms for learning, practicing, and recording guitar.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* My Toolkit */}
      <MyToolkitSection tools={my_toolkit} />

      {/* Phase recommendations */}
      {!isLoading && (
        <PhaseToolRecommendation
          recommended={recommended}
          phaseNumber={currentPhase}
          onToggle={handleToggle}
          toggling={toggling}
        />
      )}

      {/* Browse All */}
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Browse All
      </Typography>

      {/* Category tabs */}
      <Tabs
        value={categoryTab}
        onChange={(_, v) => setCategoryTab(v as ToolCategory | 'all')}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        {CATEGORIES.map(({ key, label }) => (
          <Tab
            key={key}
            value={key}
            label={label}
            sx={{ textTransform: 'none', minWidth: { xs: 48, sm: 60 } }}
          />
        ))}
      </Tabs>

      {/* Price filter chips */}
      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 0.75 }, mb: 2.5, flexWrap: 'wrap' }}>
        {PRICES.map(({ key, label }) => (
          <Chip
            key={key}
            label={label}
            size="small"
            variant={priceFilter === key ? 'filled' : 'outlined'}
            color={priceFilter === key ? 'primary' : 'default'}
            onClick={() => setPriceFilter(key)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      {/* Tool grid */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid size={{ xs: 12, sm: 6 }} key={i}>
              <ToolSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Alert severity="info">No tools match the selected filters.</Alert>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((tool) => (
            <Grid size={{ xs: 12, sm: 6 }} key={tool.key}>
              <ToolCard tool={tool} onToggle={handleToggle} toggling={toggling === tool.key} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
