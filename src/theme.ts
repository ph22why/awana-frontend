import { createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

// Modern color palette inspired by Cursor's website
const palette = {
  mode: 'dark' as PaletteMode,
  primary: {
    main: '#3B82F6', // Bright blue
    light: '#60A5FA',
    dark: '#1E40AF',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#10B981', // Emerald green
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#22C55E', // Green
    light: '#4ADE80',
    dark: '#16A34A',
    contrastText: '#FFFFFF',
  },
  error: {
    main: '#EF4444', // Red
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B', // Amber
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#000000',
  },
  info: {
    main: '#6366F1', // Indigo
    light: '#818CF8',
    dark: '#4F46E5',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#000000',
    paper: '#111827',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #3B82F6 50%, #10B981 100%)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#9CA3AF',
    disabled: '#6B7280',
  },
  divider: 'rgba(255, 255, 255, 0.12)',
};

// Create theme variants for different sections
const createMainTheme = () => createTheme({
  palette,
  typography: {
    fontFamily: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontSize: '4rem',
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.2,
      background: 'linear-gradient(to right, #60A5FA, #34D399)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h2: {
      fontSize: '3rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h4: {
      fontSize: '1.875rem',
      fontWeight: 500,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    subtitle1: {
      fontSize: '1.125rem',
      lineHeight: 1.75,
      color: '#9CA3AF',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.75,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
          padding: '0.75rem 1.5rem',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
          '&:hover': {
            background: 'linear-gradient(135deg, #60A5FA, #3B82F6)',
          },
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #10B981, #059669)',
          '&:hover': {
            background: 'linear-gradient(135deg, #34D399, #10B981)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        elevation1: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        },
        elevation2: {
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
        },
        elevation3: {
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
});

// Create admin theme with light mode
const createAdminTheme = () => createTheme({
  // ... existing admin theme configuration ...
  palette: {
    mode: 'light',
    primary: palette.primary,
    secondary: palette.secondary,
    success: palette.success,
    error: palette.error,
    warning: palette.warning,
    info: palette.info,
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },
});

export const mainTheme = createMainTheme();
export const adminTheme = createAdminTheme(); 