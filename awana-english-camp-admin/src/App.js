import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AdminPage from './components/AdminPage';
import MainPage from './components/MainPage';
import AttendancePage from './components/AttendancePage';
import LevelTestPage from './components/LevelTestPage';
import ItemDistributionPage from './components/ItemDistributionPage';
import ItemDistributionListPage from './components/ItemDistributionListPage';
import DashboardPage from './components/DashboardPage';

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
        <Route path='/item-distribution' element={<ItemDistributionPage />} />
        <Route path='/item-distribution-list' element={<ItemDistributionListPage />} />
        <Route path='/dashboard' element={<DashboardPage />} />
      </Routes>
    </Router>
    </ThemeProvider>
  );
}

export default App;
