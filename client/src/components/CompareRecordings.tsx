import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { SkillRecording } from '@gmh/shared/types/recording';

interface CompareRecordingsProps {
  oldest: SkillRecording;
  newest: SkillRecording;
  onClose: () => void;
}

function RecordingCard({ recording, label }: { recording: SkillRecording; label: string }) {
  const isVideo = recording.content_type.startsWith('video/');

  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
        {new Date(recording.recorded_at).toLocaleDateString('en', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
        {recording.duration_sec != null && ` · ${recording.duration_sec}s`}
      </Typography>
      {recording.playback_url ? (
        isVideo ? (
          <video
            src={recording.playback_url}
            controls
            style={{ width: '100%', borderRadius: 8, maxHeight: 200 }}
          />
        ) : (
          <audio src={recording.playback_url} controls style={{ width: '100%' }} />
        )
      ) : (
        <Typography variant="caption" color="text.disabled">
          Playback unavailable
        </Typography>
      )}
      {recording.notes && (
        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
          {recording.notes}
        </Typography>
      )}
    </Box>
  );
}

export function CompareRecordings({ oldest, newest, onClose }: CompareRecordingsProps) {
  return (
    <Box>
      <Button
        size="small"
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={onClose}
        sx={{ mb: 2, textTransform: 'none', color: 'text.secondary' }}
      >
        Back to recordings
      </Button>

      <Typography variant="body2" fontWeight={600} sx={{ mb: 2 }}>
        Hear your progress
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3,
        }}
      >
        <RecordingCard recording={oldest} label="Then" />
        <RecordingCard recording={newest} label="Now" />
      </Box>
    </Box>
  );
}
