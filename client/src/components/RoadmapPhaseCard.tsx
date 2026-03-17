import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import LockIcon from '@mui/icons-material/Lock';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { alpha, useTheme } from '@mui/material/styles';
import { SkillRow } from './SkillRow';
import type { RoadmapPhase, RoadmapSkill } from '@gmh/shared/types/roadmap';

interface RoadmapPhaseCardProps {
  phase: RoadmapPhase;
  isCurrentPhase: boolean;
  isSongFirst?: boolean;
  defaultExpanded?: boolean;
  onSkillClick?: (skill: RoadmapSkill) => void;
  onPreviewClick?: () => void;
}

function formatCompletionDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${d.toLocaleString('en', { month: 'short' })} ${d.getDate()}`;
}

function phaseDuration(startedAt: string, completedAt: string): string {
  const days = Math.max(
    1,
    Math.round(
      (new Date(completedAt).getTime() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24),
    ),
  );
  return `${days}d`;
}

export function RoadmapPhaseCard({
  phase,
  isCurrentPhase,
  isSongFirst,
  defaultExpanded,
  onSkillClick,
  onPreviewClick,
}: RoadmapPhaseCardProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded ?? isCurrentPhase);
  const isComplete = phase.completion_pct === 100;
  const isFuture = !isCurrentPhase && !isComplete && phase.completed_skills === 0;
  const prefix = isSongFirst ? 'Set' : 'Phase';

  return (
    <Card
      sx={{
        mb: 2.5,
        borderLeft: '3px solid',
        borderLeftColor: isCurrentPhase ? 'primary.main' : isComplete ? 'success.main' : 'divider',
        bgcolor: isCurrentPhase ? alpha(theme.palette.primary.main, 0.03) : 'background.paper',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <CardContent sx={{ pb: '12px !important' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1,
          }}
        >
          <Box sx={{ minWidth: 0, overflow: 'hidden', flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="overline"
                color={isCurrentPhase ? 'primary' : 'text.secondary'}
                sx={{ lineHeight: 1 }}
              >
                {prefix} {phase.phase_number}
              </Typography>
              {isCurrentPhase && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '0.6rem',
                    fontWeight: 700,
                  }}
                >
                  CURRENT
                </Typography>
              )}
            </Box>

            {/* Phase title */}
            {phase.phase_title && (
              <Typography variant="body2" fontWeight={500} noWrap sx={{ mt: 0.25 }}>
                {phase.phase_title}
              </Typography>
            )}

            {/* Stats + completion date */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mt: 0.25 }}
            >
              <Typography variant="caption" color="text.secondary">
                {phase.completed_skills}/{phase.total_skills} skills · {phase.completion_pct}%
              </Typography>
              {isComplete && phase.completed_at && (
                <Typography variant="caption" color="success.main">
                  · Completed {formatCompletionDate(phase.completed_at)}
                  {phase.started_at && ` · ${phaseDuration(phase.started_at, phase.completed_at)}`}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isFuture && onPreviewClick && (
              <Button
                size="small"
                variant="text"
                startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                onClick={onPreviewClick}
                sx={{ fontSize: '0.7rem', textTransform: 'none', px: 1 }}
              >
                Preview
              </Button>
            )}
            <IconButton size="small" onClick={() => setExpanded((e) => !e)}>
              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </IconButton>
          </Box>
        </Box>

        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={phase.completion_pct}
          color={isComplete ? 'success' : 'primary'}
          sx={{
            height: 4,
            borderRadius: 2,
            mb: 0,
            bgcolor: 'action.hover',
            '& .MuiLinearProgress-bar': { borderRadius: 2 },
          }}
        />

        {/* Focus skill chip — current phase only */}
        {isCurrentPhase && phase.focus_skill && (
          <Box sx={{ mt: 1.5, mb: 0.5 }}>
            <Chip
              label={`Focus on: ${phase.focus_skill.skill_title}`}
              size="small"
              color="warning"
              variant="outlined"
              onClick={() => onSkillClick?.(phase.focus_skill!)}
              sx={{ cursor: 'pointer', fontSize: '0.7rem', height: 24 }}
            />
          </Box>
        )}

        {/* Skills list */}
        <Collapse in={expanded}>
          {(() => {
            const techSkills = phase.skills.filter((s) => !s.is_song);
            const songSkills = phase.skills.filter((s) => s.is_song);

            return (
              <>
                {/* Technique skills */}
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  {techSkills.length === 0 && songSkills.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No skills in this phase yet.
                    </Typography>
                  ) : (
                    techSkills.map((skill) => (
                      <SkillRow
                        key={skill.skill_id}
                        skill={skill}
                        onClick={onSkillClick ? () => onSkillClick(skill) : undefined}
                      />
                    ))
                  )}
                </Box>

                {/* Songs sub-section */}
                {songSkills.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 1.25 }} />
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontSize: '0.6rem',
                        color: 'text.secondary',
                        display: 'block',
                        mb: 0.75,
                      }}
                    >
                      {isFuture
                        ? `${songSkills.length} song${songSkills.length > 1 ? 's' : ''} unlocked when you complete this phase`
                        : 'Songs in this phase'}
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                      {songSkills.map((song) => {
                        const isCompleted = song.completed;
                        const isLocked = isFuture;

                        const row = (
                          <Box
                            key={song.skill_id}
                            onClick={
                              !isLocked && onSkillClick ? () => onSkillClick(song) : undefined
                            }
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              minHeight: 44,
                              px: 0.5,
                              borderRadius: 1,
                              cursor: isLocked ? 'default' : onSkillClick ? 'pointer' : 'default',
                              opacity: isLocked ? 0.45 : 1,
                              '&:hover':
                                !isLocked && onSkillClick ? { bgcolor: 'action.hover' } : {},
                            }}
                          >
                            {isLocked ? (
                              <LockIcon
                                sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }}
                              />
                            ) : isCompleted ? (
                              <CheckCircleIcon
                                sx={{ fontSize: 14, color: 'success.main', flexShrink: 0 }}
                              />
                            ) : (
                              <MusicNoteIcon
                                sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }}
                              />
                            )}

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                  color: isLocked
                                    ? 'text.disabled'
                                    : isCompleted
                                      ? 'success.main'
                                      : 'text.primary',
                                  fontWeight: isCompleted ? 600 : 400,
                                }}
                              >
                                {song.skill_title}
                              </Typography>
                              {song.song_artist && (
                                <Typography variant="caption" color="text.disabled" noWrap>
                                  {song.song_artist}
                                </Typography>
                              )}
                            </Box>

                            {isCompleted && (
                              <Chip
                                label="Learned"
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: '0.6rem', height: 18, flexShrink: 0 }}
                              />
                            )}
                          </Box>
                        );

                        return isLocked ? (
                          <Tooltip
                            key={song.skill_id}
                            title={`Complete Phase ${phase.phase_number} to unlock`}
                            placement="right"
                          >
                            <span>{row}</span>
                          </Tooltip>
                        ) : (
                          row
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </>
            );
          })()}
        </Collapse>
      </CardContent>
    </Card>
  );
}
