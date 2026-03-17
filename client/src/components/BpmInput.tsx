import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import SpeedIcon from '@mui/icons-material/Speed';
import { api } from '../services/api';

interface BpmInputProps {
  skillKey: string;
  onDone: () => void;
}

export function BpmInput({ skillKey, onDone }: BpmInputProps) {
  const [bpm, setBpm] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    const val = parseInt(bpm, 10);
    if (isNaN(val) || val < 1 || val > 399) return;
    setSaving(true);
    try {
      await api.post('/api/analytics/bpm', { skill_key: skillKey, bpm: val });
    } catch {
      // BPM logging is non-critical — fail silently
    }
    onDone();
  }

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
        <SpeedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary">
          How fast were you playing? (optional)
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          type="number"
          placeholder="80"
          value={bpm}
          onChange={(e) => setBpm(e.target.value)}
          inputProps={{ min: 1, max: 399 }}
          sx={{ width: 90 }}
        />
        <Typography variant="caption" color="text.secondary">
          BPM
        </Typography>
        <Button
          size="small"
          variant="contained"
          onClick={handleSave}
          disabled={saving || !bpm}
          sx={{ ml: 0.5 }}
        >
          Log
        </Button>
        <Button size="small" variant="text" onClick={onDone} sx={{ color: 'text.secondary' }}>
          Skip
        </Button>
      </Box>
    </Box>
  );
}
