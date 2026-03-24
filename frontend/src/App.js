import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/common/Layout';
import Landing from './components/landing/Landing';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import PatientList from './components/patients/PatientList';
import PatientDetail from './components/patients/PatientDetail';
import AppointmentCalendar from './components/appointments/AppointmentCalendar';
import DentistSchedule from './components/dentists/DentistSchedule';
import MedicalRecordList from './components/medical-records/MedicalRecordList';
import MedicalRecordDetail from './components/medical-records/MedicalRecordDetail';
import BillingList from './components/billing/BillingList';
import Reports from './components/reports/Reports';
import AuditLogs from './components/reports/AuditLogs';
import UserManagement from './components/admin/UserManagement';
import Profile from './components/auth/Profile';
import { CircularProgress, Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#0288d1',
    },
    background: {
      default: '#f5f7fb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patients"
        element={
          <PrivateRoute roles={['admin', 'receptionist', 'dentist']}>
            <Layout>
              <PatientList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/patients/:id"
        element={
          <PrivateRoute roles={['admin', 'receptionist', 'dentist']}>
            <Layout>
              <PatientDetail />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/appointments"
        element={
          <PrivateRoute>
            <Layout>
              <AppointmentCalendar />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/dentist-schedule"
        element={
          <PrivateRoute roles={['admin', 'receptionist', 'dentist']}>
            <Layout>
              <DentistSchedule />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/medical-records"
        element={
          <PrivateRoute roles={['admin', 'dentist', 'receptionist']}>
            <Layout>
              <MedicalRecordList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/medical-records/:id"
        element={
          <PrivateRoute roles={['admin', 'dentist', 'receptionist']}>
            <Layout>
              <MedicalRecordDetail />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/billing"
        element={
          <PrivateRoute roles={['admin', 'receptionist']}>
            <Layout>
              <BillingList />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute roles={['admin', 'receptionist']}>
            <Layout>
              <Reports />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <PrivateRoute roles={['admin']}>
            <Layout>
              <AuditLogs />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/users"
        element={
          <PrivateRoute roles={['admin']}>
            <Layout>
              <UserManagement />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
