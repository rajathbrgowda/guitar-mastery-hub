import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import CheckIcon from '@mui/icons-material/Check';
import RemoveIcon from '@mui/icons-material/Remove';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTheme } from '@mui/material/styles';
import { alpha, keyframes } from '@mui/system';
import type { MasteryNode as MasteryNodeType } from '@gmh/shared/types';

const pulse = keyframes`
  0%   { box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0.4); }
  70%  { box-shadow: 0 0 0 8px rgba(var(--pulse-color), 0); }
  100% { box-shadow: 0 0 0 0 rgba(var(--pulse-color), 0); }
`;

interface MasteryNodeProps {
  node: MasteryNodeType;
  onSelect: (node: MasteryNodeType) => void;
}

export default function MasteryNode({ node, onSelect }: MasteryNodeProps) {
  const theme = useTheme();
  const { mastery_state, title } = node;

  const stateConfig = {
    not_started: {
      bg: theme.palette.action.disabledBackground,
      border: theme.palette.divider,
      iconColor: theme.palette.text.disabled,
      Icon: RemoveIcon,
      animate: false,
    },
    learning: {
      bg: alpha(theme.palette.primary.main, 0.12),
      border: theme.palette.primary.main,
      iconColor: theme.palette.primary.main,
      Icon: null, // dot indicator
      animate: true,
    },
    mastered: {
      bg: theme.palette.success.main,
      border: theme.palette.success.main,
      iconColor: '#fff',
      Icon: CheckIcon,
      animate: false,
    },
    rusty: {
      bg: alpha(theme.palette.warning.main, 0.15),
      border: theme.palette.warning.main,
      iconColor: theme.palette.warning.main,
      Icon: WarningAmberIcon,
      animate: false,
    },
  }[mastery_state];

  // Convert primary color hex to rgb for CSS custom property
  const [r, g, b] = theme.palette.primary.main
    .replace(/^#/, '')
    .match(/.{2}/g)!
    .map((x) => parseInt(x, 16));

  return (
    <Tooltip title={title} placement="top" arrow>
      <Box
        onClick={() => onSelect(node)}
        sx={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: `2px solid ${stateConfig.border}`,
          bgcolor: stateConfig.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          '--pulse-color': `${r}, ${g}, ${b}`,
          animation: stateConfig.animate ? `${pulse} 2s ease-in-out infinite` : 'none',
          transition: 'transform 0.15s, box-shadow 0.15s',
          '&:hover': {
            transform: 'scale(1.1)',
            boxShadow: `0 0 0 3px ${alpha(stateConfig.border, 0.25)}`,
          },
        }}
      >
        {mastery_state === 'learning' ? (
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: theme.palette.primary.main,
              opacity: 0.8,
            }}
          />
        ) : (
          stateConfig.Icon && (
            <stateConfig.Icon sx={{ fontSize: 18, color: stateConfig.iconColor }} />
          )
        )}
      </Box>
    </Tooltip>
  );
}
