import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';

interface ResourceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResourceSearchInput({ value, onChange }: ResourceSearchInputProps) {
  return (
    <TextField
      size="small"
      placeholder="Search resources…"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
      sx={{ width: { xs: '100%', sm: 280 } }}
    />
  );
}
