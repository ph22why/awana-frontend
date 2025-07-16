import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AdminPage from './components/AdminPage';
import MainPage from './components/MainPage';
import AttendancePage from './components/AttendancePage';
import LevelTestPage from './components/LevelTestPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Router basename="/tntadmin">
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<MainPage />} />
        <Route path='/attendance' element={<AttendancePage />} />
        <Route path='/level-test' element={<LevelTestPage />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
