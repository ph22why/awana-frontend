import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MainPage from './components/MainPage';
import SelectRolePage from './components/SelectRolePage';
import ChurchManagerPage from './components/ChurchManagerPage';
import IndividualTeacherPage from './components/IndividualTeacherPage';
import './App.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
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
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
