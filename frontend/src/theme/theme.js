import { createTheme } from '@mui/material/styles';
import { green } from '@mui/material/colors';

const baseTheme = {
  typography: {
    h3: {
      fontWeight: 600,
      fontSize: '2.2rem',
      '@media (max-width:600px)': {
        fontSize: '1.8rem',
      },
    },
    subtitle1: {
      fontSize: '1.1rem',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 500,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: green[700],
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: green[700],
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
}); 