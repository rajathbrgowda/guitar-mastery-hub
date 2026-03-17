import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { ResourceType } from '@gmh/shared/types/resources';

type FilterValue = ResourceType | 'all' | 'playable_now';

const TABS: Array<{ value: FilterValue; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'playable_now', label: '🎵 Playable Now' },
  { value: 'video', label: 'Video' },
  { value: 'tab', label: 'Tab' },
  { value: 'article', label: 'Article' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'tool', label: 'Tool' },
];

interface ResourceFilterBarProps {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

export function ResourceFilterBar({ value, onChange }: ResourceFilterBarProps) {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
      <Tabs
        value={value}
        onChange={(_, v: FilterValue) => onChange(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'capitalize',
            minWidth: { xs: 72, sm: 80 },
            fontSize: '0.8rem',
          },
        }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </Tabs>
    </Box>
  );
}
