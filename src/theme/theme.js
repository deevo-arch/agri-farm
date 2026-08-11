import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2E7D32',
      light: '#4CAF50',
      dark: '#1B5E20',
      contrastText: '#fff',
    },
    secondary: {
      main: '#8D6E63',
      light: '#A1887F',
      dark: '#5D4037',
      contrastText: '#fff',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    success: {
      main: '#2E7D32',
      light: '#4CAF50',
    },
    error: {
      main: '#C62828',
      light: '#EF5350',
    },
    warning: {
      main: '#EF6C00',
      light: '#FF9800',
    },
    info: {
      main: '#0288D1',
      light: '#03A9F4',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 600 },
    h5: { fontSize: '1.25rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, padding: '8px 16px' },
        contained: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
      },
    },
    MuiCard: { styleOverrides: { root: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } } },
    MuiPaper: { styleOverrides: { root: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } } },
    MuiTextField: { styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 16 } } },
    MuiAppBar: { styleOverrides: { root: { boxShadow: '0 2px 4px rgba(0,0,0,0.1)' } } },
    MuiDrawer: { styleOverrides: { paper: { borderRight: '1px solid #E0E0E0' } } },
  },
});

export default theme;