import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Slider from '@mui/material/Slider';
import CheckIcon from '@mui/icons-material/Check';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import { useAuth } from '../context/AuthContext';
import { useUserStore } from '../store/userStore';
import { supabase } from '../lib/supabase';
import api from '../services/api';
import { THEME_COLORS } from '../theme/themeColors';
import type { ThemeKey } from '../types/user';

const GUITAR_TYPES = [
  { value: 'acoustic', label: 'Acoustic' },
  { value: 'electric', label: 'Electric' },
  { value: 'classical', label: 'Classical' },
  { value: 'bass', label: 'Bass' },
  { value: 'other', label: 'Other' },
];

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, loading: profileLoading, fetchProfile, updateProfile } = useUserStore();

  // Profile fields
  const [displayName, setDisplayName] = useState('');
  const [guitarType, setGuitarType] = useState('acoustic');
  const [yearsPlaying, setYearsPlaying] = useState(0);
  const [timezone, setTimezone] = useState('UTC');

  // Goals fields
  const [dailyGoal, setDailyGoal] = useState(20);
  const [practiceDays, setPracticeDays] = useState(5);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [goalsMsg, setGoalsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const [exporting, setExporting] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!profile) fetchProfile();
  }, [fetchProfile, profile]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setGuitarType(profile.guitar_type ?? 'acoustic');
      setYearsPlaying(profile.years_playing ?? 0);
      setTimezone(profile.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone);
      setDailyGoal(profile.daily_goal_min ?? 20);
      setPracticeDays(profile.practice_days_target ?? 5);
    }
  }, [profile]);

  async function handleSaveProfile() {
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await updateProfile({
        display_name: displayName.trim() || null,
        guitar_type: guitarType as 'acoustic' | 'electric' | 'classical' | 'bass' | 'other',
        years_playing: yearsPlaying,
        timezone,
      });
      setProfileMsg({ type: 'success', text: 'Profile saved.' });
    } catch {
      setProfileMsg({ type: 'error', text: 'Failed to save. Try again.' });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSaveGoals() {
    setSavingGoals(true);
    setGoalsMsg(null);
    try {
      await updateProfile({ daily_goal_min: dailyGoal, practice_days_target: practiceDays });
      setGoalsMsg({ type: 'success', text: 'Goals saved.' });
    } catch {
      setGoalsMsg({ type: 'error', text: 'Failed to save. Try again.' });
    } finally {
      setSavingGoals(false);
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const response = await api.get('/api/users/me/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'practice-sessions.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      /* silent */
    } finally {
      setExporting(false);
    }
  }

  async function handleResetProgress() {
    setResetting(true);
    setResetMsg(null);
    try {
      await api.delete('/api/users/me/progress');
      setResetOpen(false);
      setResetMsg({ type: 'success', text: 'All skill progress has been reset.' });
    } catch {
      setResetMsg({ type: 'error', text: 'Reset failed. Try again.' });
    } finally {
      setResetting(false);
    }
  }

  async function handleChangePassword() {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email);
    setProfileMsg({ type: 'success', text: 'Password reset email sent.' });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
  }

  const avatarInitials = (profile?.display_name ?? user?.email ?? '?')
    .split(/[\s@]/)[0]
    .slice(0, 2)
    .toUpperCase();

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  const profileFailed = !profileLoading && !profile;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Settings
      </Typography>

      {profileFailed && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Could not load your profile — changes may not save correctly. Check that the server is
          running and migration 005 has been applied.
        </Alert>
      )}

      {/* ── Profile ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Profile
          </Typography>

          {/* Avatar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2, mb: 2.5 }}>
            <Avatar
              src={profile?.avatar_url ?? undefined}
              sx={{ width: 72, height: 72, fontSize: '1.5rem', bgcolor: 'primary.main' }}
            >
              {avatarInitials}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {profile?.display_name ?? user?.email?.split('@')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Member since {memberSince}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              size="small"
              fullWidth
              inputProps={{ maxLength: 50 }}
            />
            <TextField
              label="Guitar type"
              select
              value={guitarType}
              onChange={(e) => setGuitarType(e.target.value)}
              size="small"
              fullWidth
            >
              {GUITAR_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  {t.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Years playing"
              type="number"
              value={yearsPlaying}
              onChange={(e) => setYearsPlaying(Math.max(0, parseInt(e.target.value) || 0))}
              size="small"
              sx={{ width: 160 }}
              inputProps={{ min: 0, max: 60 }}
            />
            <TextField
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              size="small"
              fullWidth
              helperText="IANA timezone name e.g. America/New_York"
            />
          </Box>

          {profileMsg && (
            <Alert severity={profileMsg.type} sx={{ mt: 2 }}>
              {profileMsg.text}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleSaveProfile}
            disabled={savingProfile}
            startIcon={savingProfile ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ mt: 2 }}
          >
            {savingProfile ? 'Saving...' : 'Save profile'}
          </Button>
        </CardContent>
      </Card>

      {/* ── Practice Goals ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Practice Goals
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight={500} sx={{ mb: 0.5 }}>
              Daily goal — <strong>{dailyGoal} min</strong>
            </Typography>
            <Slider
              value={dailyGoal}
              onChange={(_, v) => setDailyGoal(v as number)}
              min={5}
              max={120}
              step={5}
              marks={[
                { value: 5, label: '5m' },
                { value: 30, label: '30m' },
                { value: 60, label: '60m' },
                { value: 120, label: '2h' },
              ]}
              sx={{ color: 'primary.main', mt: 1, mb: 2.5 }}
            />

            <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
              Practice days per week
            </Typography>
            <ToggleButtonGroup
              value={practiceDays}
              exclusive
              onChange={(_, v) => v !== null && setPracticeDays(v)}
              size="small"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <ToggleButton
                  key={d}
                  value={d}
                  sx={{ px: 1.5, textTransform: 'none', fontSize: '0.8rem' }}
                >
                  {d}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              {practiceDays} day{practiceDays !== 1 ? 's' : ''} / week
            </Typography>
          </Box>

          {goalsMsg && (
            <Alert severity={goalsMsg.type} sx={{ mt: 2 }}>
              {goalsMsg.text}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleSaveGoals}
            disabled={savingGoals}
            startIcon={savingGoals ? <CircularProgress size={16} color="inherit" /> : null}
            sx={{ mt: 2 }}
          >
            {savingGoals ? 'Saving...' : 'Save goals'}
          </Button>
        </CardContent>
      </Card>

      {/* ── Appearance ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Appearance
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Theme color — applied instantly across the app.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {(Object.entries(THEME_COLORS) as [ThemeKey, { name: string; color: string }][]).map(
              ([key, { name, color }]) => {
                const selected = (profile?.theme_color ?? 'helix') === key;
                return (
                  <Box
                    key={key}
                    onClick={() => updateProfile({ theme_color: key })}
                    title={name}
                    sx={{
                      position: 'relative',
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: color,
                      cursor: 'pointer',
                      border: selected ? '2px solid' : '2px solid transparent',
                      borderColor: selected ? 'text.primary' : 'transparent',
                      outline: selected ? '2px solid' : 'none',
                      outlineColor: selected ? color : 'transparent',
                      outlineOffset: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.1s',
                      '&:hover': { transform: 'scale(1.12)' },
                    }}
                  >
                    {selected && <CheckIcon sx={{ fontSize: 16, color: '#fff' }} />}
                  </Box>
                );
              },
            )}
          </Box>
          <Box sx={{ mt: 1.5, display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {(Object.entries(THEME_COLORS) as [ThemeKey, { name: string; color: string }][]).map(
              ([key, { name }]) => (
                <Typography
                  key={key}
                  variant="caption"
                  sx={{
                    width: 32,
                    textAlign: 'center',
                    fontSize: '0.6rem',
                    color:
                      (profile?.theme_color ?? 'helix') === key ? 'text.primary' : 'text.disabled',
                    fontWeight: (profile?.theme_color ?? 'helix') === key ? 600 : 400,
                  }}
                >
                  {name}
                </Typography>
              ),
            )}
          </Box>
        </CardContent>
      </Card>

      {/* ── Account ── */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary">
            Account
          </Typography>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="body2">{user?.email}</Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button variant="outlined" size="small" onClick={handleChangePassword}>
              Change password
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={exporting ? <CircularProgress size={14} /> : <DownloadOutlinedIcon />}
              onClick={handleExport}
              disabled={exporting}
            >
              Export data
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutOutlinedIcon />}
              onClick={handleSignOut}
            >
              Sign out
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* ── Danger zone ── */}
      <Card sx={{ border: '1px solid', borderColor: 'error.light' }}>
        <CardContent>
          <Typography variant="overline" color="error">
            Danger zone
          </Typography>

          {resetMsg && (
            <Alert severity={resetMsg.type} sx={{ mt: 1.5, mb: 1 }}>
              {resetMsg.text}
            </Alert>
          )}

          <Divider sx={{ my: 1.5 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                Reset all progress
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Clears all skill checkboxes and resets phase to Foundation.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => setResetOpen(true)}
            >
              Reset
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Reset confirm dialog */}
      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle>Reset all progress?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will clear all skill checkboxes and reset your phase to Foundation. Practice
            sessions will not be affected.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)} disabled={resetting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleResetProgress}
            disabled={resetting}
            startIcon={resetting ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {resetting ? 'Resetting...' : 'Yes, reset'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
