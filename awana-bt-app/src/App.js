import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainPage from './components/MainPage';
import SelectRolePage from './components/SelectRolePage';
import ChurchManagerPage from './components/ChurchManagerPage';
import IndividualTeacherPage from './components/IndividualTeacherPage';
import KeyInputPage from './components/KeyInputPage';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#9f93f3',
      dark: '#4c63d2',
    },
    secondary: {
      main: '#f093fb',
      light: '#f4c2f5',
      dark: '#e056a0',
    },
    background: {
      default: '#f7fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3748',
      secondary: '#4a5568',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename="/bt">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/select-role" element={<SelectRolePage />} />
          <Route path="/church-manager" element={<ChurchManagerPage />} />
          <Route path="/individual-teacher" element={<IndividualTeacherPage />} />
          <Route path="/key-input" element={<KeyInputPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
