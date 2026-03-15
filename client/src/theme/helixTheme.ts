import { createTheme } from '@mui/material/styles';

const helixTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ea580c',
      light: '#f97316',
      dark: '#c2410c',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f7f5f2',
    },
    text: {
      primary: '#171414',
      secondary: '#5c5858',
    },
    divider: '#e5e0df',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
    h1: { fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.02em' },
    h2: { fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.25rem', fontWeight: 600 },
    h4: { fontSize: '1.125rem', fontWeight: 600 },
    h5: { fontSize: '1rem', fontWeight: 600 },
    h6: { fontSize: '0.875rem', fontWeight: 600 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    caption: {
      fontFamily: '"IBM Plex Mono", "Courier New", monospace',
      fontSize: '0.75rem',
    },
    overline: {
      fontFamily: '"IBM Plex Mono", "Courier New", monospace',
      fontSize: '0.6875rem',
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 10 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: '1px solid #e5e0df',
          boxShadow: '0 1px 3px rgba(23,20,20,0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 6, textTransform: 'none', fontWeight: 500 },
        contained: { boxShadow: 'none', '&:hover': { boxShadow: 'none' } },
      },
    },
    MuiChip: {
      styleOverrides: { root: { borderRadius: 6 } },
    },
    MuiInputBase: {
      styleOverrides: {
        root: { borderRadius: 6 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 6 },
        notchedOutline: { borderColor: '#e5e0df' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&.Mui-selected': {
            backgroundColor: '#fef3ee',
            color: '#ea580c',
            '& .MuiListItemIcon-root': { color: '#ea580c' },
            '&:hover': { backgroundColor: '#fde8d8' },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#e5e0df' } },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e5e0df',
          boxShadow: 'none',
          color: '#171414',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #e5e0df',
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

export default helixTheme;
