import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useTheme } from '@mui/material/styles';
import { format } from 'date-fns';
import type { MasteryNode } from '@gmh/shared/types';
import type { ConfidenceRating } from '@gmh/shared/types/practice-plan';

const STATE_LABELS: Record<
  string,
  { label: string; color: 'default' | 'primary' | 'success' | 'warning' }
> = {
  not_started: { label: 'Not started', color: 'default' },
  learning: { label: 'Learning', color: 'primary' },
  mastered: { label: 'Mastered', color: 'success' },
  rusty: { label: 'Rusty — revisit', color: 'warning' },
};

function ConfidenceSparkline({ history }: { history: ConfidenceRating[] }) {
  if (history.length === 0) {
    return (
      <Typography variant="caption" color="text.disabled">
        No practice data yet
      </Typography>
    );
  }

  const DOT_COLOR: Record<number, string> = { 1: '#ef4444', 2: '#f59e0b', 3: '#22c55e' };
  const DOT_LABEL: Record<number, string> = { 1: 'Hard', 2: 'Okay', 3: 'Easy' };

  return (
    <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center' }}>
      {history.map((r, i) => (
        <Box
          key={i}
          title={DOT_LABEL[r]}
          sx={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            bgcolor: DOT_COLOR[r],
            flexShrink: 0,
          }}
        />
      ))}
      <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
        last {history.length}
      </Typography>
    </Box>
  );
}

interface MasteryNodePanelProps {
  node: MasteryNode | null;
  onClose: () => void;
  onMarkRevisited: (node: MasteryNode) => void;
}

export default function MasteryNodePanel({
  node,
  onClose,
  onMarkRevisited,
}: MasteryNodePanelProps) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={node !== null}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 340 }, p: 0 } }}
    >
      {node && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                {node.title}
              </Typography>
              <Box sx={{ mt: 0.75 }}>
                <Chip
                  label={STATE_LABELS[node.mastery_state]?.label ?? node.mastery_state}
                  color={STATE_LABELS[node.mastery_state]?.color ?? 'default'}
                  size="small"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              </Box>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ mt: -0.5 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Body */}
          <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>
            {/* Last practiced */}
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.5 }}
            >
              Last practiced
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {node.last_practiced_at
                ? format(new Date(node.last_practiced_at), 'MMM d, yyyy')
                : 'Not yet practiced'}
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            {/* Confidence sparkline */}
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: 'block', mb: 0.75 }}
            >
              Confidence history
            </Typography>
            <Box sx={{ mb: 2 }}>
              <ConfidenceSparkline history={node.confidence_history} />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Practice tip */}
            {node.practice_tip && (
              <>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  Practice tip
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                  {node.practice_tip}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
              </>
            )}

            {/* Video link */}
            {node.youtube_id && (
              <>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.75 }}
                >
                  Video lesson
                </Typography>
                <Box
                  component="a"
                  href={`https://www.youtube.com/watch?v=${node.youtube_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'block', mb: 2, textDecoration: 'none' }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      borderRadius: 1,
                      overflow: 'hidden',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      component="img"
                      src={`https://img.youtube.com/vi/${node.youtube_id}/mqdefault.jpg`}
                      alt="Video thumbnail"
                      sx={{ width: '100%', display: 'block' }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'rgba(0,0,0,0.25)',
                      }}
                    >
                      <OpenInNewIcon sx={{ color: '#fff', fontSize: 32 }} />
                    </Box>
                  </Box>
                </Box>
              </>
            )}
          </Box>

          {/* Footer action */}
          {node.mastery_state === 'rusty' && (
            <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Button
                variant="contained"
                fullWidth
                color="warning"
                onClick={() => onMarkRevisited(node)}
              >
                Mark as Revisited
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Drawer>
  );
}
