import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useResourcesStore } from '../store/resourcesStore';
import { RecommendedResources } from '../components/RecommendedResources';
import { ResourceCard } from '../components/ResourceCard';
import { ResourceFilterBar } from '../components/ResourceFilterBar';
import { ResourceSearchInput } from '../components/ResourceSearchInput';
import type { ResourceType } from '@gmh/shared/types/resources';

export default function Resources() {
  const { data, loading, error, fetchResources, markComplete } = useResourcesStore();
  const [filter, setFilter] = useState<ResourceType | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  const allResources = data?.all ?? [];

  const filtered = allResources.filter((r) => {
    const matchesType = filter === 'all' || r.type === filter;
    const matchesSearch = search === '' || r.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Resources
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Recommended section */}
      {loading ? (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[1, 2, 3].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 4 }}>
              <Skeleton variant="rounded" height={140} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <RecommendedResources resources={data?.recommended ?? []} onMarkComplete={markComplete} />
      )}

      {/* Filter + search bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1,
        }}
      >
        <Typography variant="overline" color="text.secondary">
          All resources
        </Typography>
        <ResourceSearchInput value={search} onChange={setSearch} />
      </Box>

      <ResourceFilterBar value={filter} onChange={setFilter} />

      {/* All resources grid */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={160} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No resources match your search.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((r) => (
            <Grid key={r.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ResourceCard resource={r} onMarkComplete={markComplete} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
