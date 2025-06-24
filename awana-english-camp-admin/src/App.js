import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AdminPage from './components/AdminPage';
import MainPage from './components/MainPage';
import AttendancePage from './components/AttendancePage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<MainPage />} />
          <Route path='/attendance' element={<AttendancePage />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
