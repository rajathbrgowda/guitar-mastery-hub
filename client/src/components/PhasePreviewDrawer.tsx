import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import type { RoadmapPhase } from '@gmh/shared/types/roadmap';

interface PhasePreviewDrawerProps {
  nextPhase: RoadmapPhase | null;
  open: boolean;
  onClose: () => void;
}

export function PhasePreviewDrawer({ nextPhase, open, onClose }: PhasePreviewDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: 340, p: 0 } }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          {nextPhase ? `Phase ${nextPhase.phase_number} Preview` : 'Final Phase'}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ px: 2, py: 2, overflowY: 'auto' }}>
        {!nextPhase ? (
          <Typography variant="body2" color="text.secondary">
            You&apos;re on the final phase! Keep practising to master everything.
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {nextPhase.total_skills} skills coming up in Phase {nextPhase.phase_number}
            </Typography>
            {nextPhase.skills.map((skill) => (
              <Box
                key={skill.skill_id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 0.5,
                }}
              >
                <Typography variant="body2">{skill.skill_title}</Typography>
                <Chip
                  label={skill.skill_category}
                  size="small"
                  sx={{ fontSize: '0.6rem', height: 20, textTransform: 'capitalize' }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
