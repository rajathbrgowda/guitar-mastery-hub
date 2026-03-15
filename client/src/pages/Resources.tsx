import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Collapse from '@mui/material/Collapse';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import api from '../services/api';

interface Resource {
  id: string;
  phase_index: number;
  title: string;
  url: string | null;
  description: string | null;
  type: string;
  is_featured: boolean;
  sort_order: number;
  completion: number;
}

const PHASE_TITLES = ['Foundation', 'Beginner', 'Intermediate', 'Advanced', 'Mastery'];

const TYPE_COLORS: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'info'> = {
  course: 'primary',
  video: 'info',
  tool: 'success',
  article: 'default',
  link: 'default',
};

const COMPLETION_LABELS = [
  { value: 0, label: 'Not started' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: 'Done' },
];

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<number>(0);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Resource[]>('/api/resources')
      .then((r) => setResources(r.data))
      .catch(() => setError('Failed to load resources.'))
      .finally(() => setLoading(false));
  }, []);

  async function setCompletion(resourceId: string, completion: number) {
    setUpdating(resourceId);
    try {
      await api.patch(`/api/resources/${resourceId}`, { completion });
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, completion } : r))
      );
    } catch {
      // silent
    } finally {
      setUpdating(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const byPhase = PHASE_TITLES.map((title, i) => ({
    title,
    index: i,
    items: resources.filter((r) => r.phase_index === i),
  }));

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Phase-mapped learning links. Track what you've started and completed.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {byPhase.map(({ title, index, items }) => {
        const completed = items.filter((r) => r.completion === 100).length;
        const phaseProgress = items.length ? Math.round((completed / items.length) * 100) : 0;

        return (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent sx={{ pb: expanded === index ? 1 : '16px !important' }}>
              {/* Phase header */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 1.5 }}
                onClick={() => setExpanded(expanded === index ? -1 : index)}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" color="text.secondary">
                    Phase {index + 1}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {title}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: '"IBM Plex Mono", monospace', fontSize: '0.85rem', color: 'text.secondary' }}>
                  {completed}/{items.length}
                </Typography>
                {expanded === index ? (
                  <KeyboardArrowUpIcon sx={{ color: 'text.secondary' }} />
                ) : (
                  <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                )}
              </Box>

              <LinearProgress
                variant="determinate"
                value={phaseProgress}
                sx={{ mt: 1.5, height: 5, borderRadius: 4, bgcolor: '#f0ece9' }}
              />

              {/* Resources list */}
              <Collapse in={expanded === index}>
                <Box sx={{ mt: 2 }}>
                  {items.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No resources for this phase yet.
                    </Typography>
                  ) : (
                    items.map((r) => (
                      <Box
                        key={r.id}
                        sx={{
                          py: 1.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.75 }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
                              {r.is_featured && (
                                <Chip label="featured" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem' }} />
                              )}
                              <Chip
                                label={r.type}
                                size="small"
                                color={TYPE_COLORS[r.type] ?? 'default'}
                                variant="outlined"
                                sx={{ height: 16, fontSize: '0.6rem' }}
                              />
                            </Box>
                            {r.url ? (
                              <Box
                                component="a"
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                  color: 'primary.main', textDecoration: 'none',
                                  '&:hover': { textDecoration: 'underline' },
                                }}
                              >
                                <Typography variant="body2" fontWeight={600}>{r.title}</Typography>
                                <OpenInNewOutlinedIcon sx={{ fontSize: 13 }} />
                              </Box>
                            ) : (
                              <Typography variant="body2" fontWeight={600}>{r.title}</Typography>
                            )}
                            {r.description && (
                              <Typography variant="caption" color="text.secondary">
                                {r.description}
                              </Typography>
                            )}
                          </Box>

                          {/* Completion selector */}
                          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            {updating === r.id ? (
                              <CircularProgress size={16} />
                            ) : (
                              COMPLETION_LABELS.map((cl) => (
                                <Chip
                                  key={cl.value}
                                  label={cl.label}
                                  size="small"
                                  variant={r.completion >= cl.value && (cl.value === 0 ? r.completion === 0 : true) ? 'filled' : 'outlined'}
                                  color={r.completion === cl.value ? 'primary' : 'default'}
                                  onClick={() => setCompletion(r.id, cl.value)}
                                  sx={{ cursor: 'pointer', height: 20, fontSize: '0.6rem' }}
                                />
                              ))
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}
