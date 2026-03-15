import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha, useTheme } from '@mui/material/styles';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import MobileStepper from '@mui/material/MobileStepper';
import Skeleton from '@mui/material/Skeleton';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import type { ExperienceLevel } from '@gmh/shared/types/user';
import { useOnboardingStore } from '../store/onboardingStore';
import { useCurriculumStore } from '../store/curriculumStore';

// ─── Step 1: Experience ──────────────────────────────────────────────────────

const EXPERIENCE_OPTIONS: {
  level: ExperienceLevel;
  title: string;
  subtitle: string;
  detail: string;
}[] = [
  {
    level: 'beginner',
    title: 'Complete beginner',
    subtitle: "I've never played",
    detail: 'Start from posture, tuning, and your first chords.',
  },
  {
    level: 'some',
    title: 'Some experience',
    subtitle: 'I know a few chords',
    detail: 'Consolidate basics and start building a repertoire.',
  },
  {
    level: 'intermediate',
    title: 'Intermediate',
    subtitle: 'I can play songs',
    detail: 'Push into barre chords, scales, and improvisation.',
  },
];

function ExperienceStep() {
  const { experienceLevel, setExperience } = useOnboardingStore();
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        What's your experience level?
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        We'll set your starting phase and tailor the practice plan to match.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {EXPERIENCE_OPTIONS.map((opt) => {
          const selected = experienceLevel === opt.level;
          return (
            <Card
              key={opt.level}
              variant="outlined"
              sx={{
                borderColor: selected ? 'primary.main' : 'divider',
                borderWidth: selected ? 2 : 1,
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <CardActionArea onClick={() => setExperience(opt.level)}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {opt.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {opt.subtitle}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ mt: 0.5, display: 'block' }}
                      >
                        {opt.detail}
                      </Typography>
                    </Box>
                    {selected && <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Step 2: Curriculum ──────────────────────────────────────────────────────

function CurriculumStep() {
  const { curriculumKey, setCurriculum } = useOnboardingStore();
  const { curricula, isLoadingList, listError, fetchCurricula } = useCurriculumStore();
  const theme = useTheme();

  useEffect(() => {
    if (curricula.length === 0) fetchCurricula();
  }, [curricula.length, fetchCurricula]);

  if (isLoadingList) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Choose your curriculum
        </Typography>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={90} />
        ))}
      </Box>
    );
  }

  if (listError) {
    return (
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Choose your curriculum
        </Typography>
        <Alert severity="error">
          Couldn't load curricula. Check your connection and try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Choose your curriculum
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Each curriculum is a different teaching approach. You can change this later in Settings.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {curricula.map((c) => {
          const selected = curriculumKey === c.key;
          return (
            <Card
              key={c.key}
              variant="outlined"
              sx={{
                borderColor: selected ? 'primary.main' : 'divider',
                borderWidth: selected ? 2 : 1,
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                transition: 'border-color 0.15s, background-color 0.15s',
              }}
            >
              <CardActionArea onClick={() => setCurriculum(c.key)}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ flex: 1, mr: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          flexWrap: 'wrap',
                          mb: 0.25,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={700}>
                          {c.name}
                        </Typography>
                        {c.author && (
                          <Typography variant="caption" color="text.secondary">
                            by {c.author}
                          </Typography>
                        )}
                        {c.style && (
                          <Chip
                            label={c.style}
                            size="small"
                            sx={{ fontSize: '0.6rem', height: 18, textTransform: 'capitalize' }}
                          />
                        )}
                      </Box>
                      {c.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.5 }}
                        >
                          {c.description}
                        </Typography>
                      )}
                    </Box>
                    {selected && <CheckCircleIcon sx={{ color: 'primary.main', flexShrink: 0 }} />}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

// ─── Step 3: Goal ────────────────────────────────────────────────────────────

function GoalStep() {
  const { dailyGoalMin, practiceDaysTarget, setGoal } = useOnboardingStore();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Set your practice goal
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Be realistic — consistency matters more than duration. You can update this any time.
      </Typography>

      {/* Daily minutes */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Daily practice time
          </Typography>
          <Typography
            sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: '1.25rem' }}
          >
            {dailyGoalMin} min
          </Typography>
        </Box>
        <Slider
          value={dailyGoalMin}
          min={10}
          max={60}
          step={5}
          onChange={(_, v) => setGoal(v as number, practiceDaysTarget)}
          marks={[
            { value: 10, label: '10' },
            { value: 20, label: '20' },
            { value: 30, label: '30' },
            { value: 45, label: '45' },
            { value: 60, label: '60 min' },
          ]}
          valueLabelDisplay="off"
        />
      </Box>

      {/* Days per week */}
      <Box>
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}
        >
          <Typography variant="subtitle2" fontWeight={600}>
            Days per week
          </Typography>
          <Typography
            sx={{ fontFamily: '"IBM Plex Mono", monospace', fontWeight: 700, fontSize: '1.25rem' }}
          >
            {practiceDaysTarget}d
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <Button
              key={d}
              variant={practiceDaysTarget === d ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setGoal(dailyGoalMin, d)}
              sx={{ minWidth: 40, px: 1 }}
            >
              {d}
            </Button>
          ))}
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {practiceDaysTarget <= 3
            ? 'A relaxed pace — perfect for busy schedules.'
            : practiceDaysTarget <= 5
              ? 'A solid habit-building pace.'
              : 'Ambitious — great if you can keep it up!'}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

const STEPS = ['Experience', 'Curriculum', 'Goal'];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { step, experienceLevel, curriculumKey, submitting, submitError, setStep, submit } =
    useOnboardingStore();

  const stepIndex = step - 1;
  const canNext =
    (step === 1 && experienceLevel !== null) ||
    (step === 2 && curriculumKey !== null) ||
    step === 3;

  const handleNext = async () => {
    if (step < 3) {
      setStep((step + 1) as 1 | 2 | 3);
    } else {
      try {
        await submit();
        navigate('/app', { replace: true });
      } catch {
        // submitError is set in store
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as 1 | 2 | 3);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `radial-gradient(ellipse at top left, ${alpha(theme.palette.primary.main, 0.06)}, transparent 55%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 520 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.1em' }}>
            Guitar Mastery Hub
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
            Let's get you set up
          </Typography>
        </Box>

        {/* Step dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
          {STEPS.map((label, i) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor:
                    i < stepIndex ? 'primary.main' : i === stepIndex ? 'primary.main' : 'divider',
                  opacity: i === stepIndex ? 1 : i < stepIndex ? 0.5 : 0.3,
                  transition: 'all 0.2s',
                }}
              />
              {i < STEPS.length - 1 && (
                <Box
                  sx={{
                    width: 24,
                    height: 1,
                    bgcolor: i < stepIndex ? 'primary.main' : 'divider',
                    opacity: i < stepIndex ? 0.4 : 0.2,
                    transition: 'all 0.2s',
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        {/* Step label */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: 'block',
            textAlign: 'center',
            mb: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          Step {step} of {STEPS.length} — {STEPS[stepIndex]}
        </Typography>

        {/* Content card */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 3,
            p: { xs: 2.5, sm: 3.5 },
            boxShadow: `0 2px 24px ${alpha(theme.palette.primary.main, 0.08)}`,
            mb: 3,
          }}
        >
          {step === 1 && <ExperienceStep />}
          {step === 2 && <CurriculumStep />}
          {step === 3 && <GoalStep />}

          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
        </Box>

        {/* Navigation */}
        <MobileStepper
          variant="dots"
          steps={3}
          position="static"
          activeStep={stepIndex}
          sx={{ bgcolor: 'transparent', justifyContent: 'space-between', px: 0 }}
          backButton={
            <Button
              size="small"
              onClick={handleBack}
              disabled={step === 1}
              startIcon={<KeyboardArrowLeftIcon />}
            >
              Back
            </Button>
          }
          nextButton={
            <Button
              size="small"
              variant="contained"
              onClick={handleNext}
              disabled={!canNext || submitting}
              endIcon={
                submitting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : step < 3 ? (
                  <KeyboardArrowRightIcon />
                ) : null
              }
            >
              {step < 3 ? 'Next' : submitting ? 'Setting up…' : 'Get started'}
            </Button>
          }
        />
      </Box>
    </Box>
  );
}
