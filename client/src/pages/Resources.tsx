import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useResourcesStore } from '../store/resourcesStore';
import { useRoadmapStore } from '../store/roadmapStore';
import { RecommendedResources } from '../components/RecommendedResources';
import { ResourceCard } from '../components/ResourceCard';
import { ResourceFilterBar } from '../components/ResourceFilterBar';
import { ResourceSearchInput } from '../components/ResourceSearchInput';
import type { ResourceType } from '@gmh/shared/types/resources';
import type { RoadmapSkill } from '@gmh/shared/types/roadmap';

type FilterValue = ResourceType | 'all' | 'playable_now';

export default function Resources() {
  const navigate = useNavigate();
  const { data, loading, error, fetchResources, markComplete } = useResourcesStore();
  const { data: roadmapData, fetchRoadmap } = useRoadmapStore();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    if (!roadmapData) fetchRoadmap();
  }, [roadmapData, fetchRoadmap]);

  const allResources = data?.all ?? [];

  // Songs playable now: song skills from phases up to and including current phase
  const playableSongs: RoadmapSkill[] = (roadmapData?.phases ?? [])
    .filter((p) => p.phase_number <= (roadmapData?.current_phase ?? 0))
    .flatMap((p) => p.skills.filter((s) => s.is_song));

  const filtered = allResources.filter((r) => {
    const matchesType = filter === 'all' || filter === 'playable_now' || r.type === filter;
    const matchesSearch = search === '' || r.title.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const showPlayableNow = filter === 'playable_now';

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ fontSize: { xs: '1.4rem', sm: '2.125rem' } }}
      >
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

      <ResourceFilterBar value={filter} onChange={(v) => setFilter(v as FilterValue)} />

      {/* Playable Now — song skills from unlocked phases */}
      {showPlayableNow && (
        <>
          {playableSongs.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <MusicNoteIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Complete Phase 1 to unlock your first songs.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {playableSongs.map((song) => (
                <Grid key={song.skill_id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      borderColor: song.completed ? 'success.main' : 'divider',
                    }}
                  >
                    <CardActionArea
                      onClick={() => navigate('/app/roadmap')}
                      sx={{ height: '100%' }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                          {song.completed ? (
                            <CheckCircleIcon
                              sx={{ fontSize: 16, color: 'success.main', mt: 0.25, flexShrink: 0 }}
                            />
                          ) : (
                            <MusicNoteIcon
                              sx={{ fontSize: 16, color: 'primary.main', mt: 0.25, flexShrink: 0 }}
                            />
                          )}
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" fontWeight={700} noWrap>
                              {song.skill_title}
                            </Typography>
                            {song.song_artist && (
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {song.song_artist}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        {song.completed && (
                          <Chip
                            label="Learned"
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontSize: '0.6rem', height: 18 }}
                          />
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* All resources grid */}
      {!showPlayableNow &&
        (loading ? (
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
        ))}
    </Box>
  );
}
