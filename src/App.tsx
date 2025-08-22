import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { mainTheme, adminTheme } from './theme';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import MainPage from './pages/MainPage';
import EventListPage from './pages/EventListPage';
import ChurchListPage from './pages/ChurchListPage';
import ReceiptPage from './pages/ReceiptPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import EventManagePage from './pages/admin/EventManagePage';
import ChurchManagePage from './pages/admin/ChurchManagePage';
import ReceiptManagePage from './pages/admin/ReceiptManagePage';
import EventReceiptManagePage from './pages/admin/EventReceiptManagePage';
import EventCreatePage from './pages/admin/EventCreatePage';
import EventEditPage from './pages/admin/EventEditPage';
import OnsiteRegisterPage from './pages/admin/OnsiteRegisterPage';
import ReceiptStatusPage from './pages/admin/ReceiptStatusPage';
import NewChurchRegistrationPage from './pages/admin/NewChurchRegistrationPage';
import RenewChurchRegistrationPage from './pages/admin/RenewChurchRegistrationPage';

// Theme wrapper component to handle theme switching
const ThemedApp: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const currentTheme = isAdminRoute ? adminTheme : mainTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <CssBaseline />
      <Routes>
        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/events" element={<EventListPage />} />
          <Route path="/churches" element={<ChurchListPage />} />
          <Route path="/receipts" element={<ReceiptPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<EventManagePage />} />
          <Route path="events/create" element={<EventCreatePage />} />
          <Route path="events/edit/:id" element={<EventEditPage />} />
          <Route path="churches/*" element={<ChurchManagePage />} />
          <Route path="new-registration" element={<NewChurchRegistrationPage />} />
          <Route path="renew-registration" element={<RenewChurchRegistrationPage />} />
          <Route path="receipts" element={<ReceiptManagePage />} />
          <Route path="receipts/events" element={<EventReceiptManagePage />} />
          <Route path="onsite" element={<OnsiteRegisterPage />} />
          <Route path="receipt-status" element={<ReceiptStatusPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemedApp />
    </BrowserRouter>
  );
};

export default App; 