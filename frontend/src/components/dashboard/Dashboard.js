import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Avatar,
  Button,
} from '@mui/material';
import {
  People,
  CalendarMonth,
  Receipt,
  TrendingUp,
  MedicalServices,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color={color} mt={0.5}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: `${color}.light`, color: color, width: 52, height: 52 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const statusColors = {
  scheduled: 'default',
  confirmed: 'primary',
  'in-progress': 'warning',
  completed: 'success',
  cancelled: 'error',
  'no-show': 'error',
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/reports/dashboard')
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Welcome back, {user?.name?.split(' ')[0]}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Typography>
        </Box>
        {(user?.role === 'admin' || user?.role === 'receptionist') && (
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => navigate('/patients')}
          >
            Add Patient
          </Button>
        )}
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Total Patients"
            value={stats?.totalPatients || 0}
            icon={<People />}
            color="primary"
            subtitle="Active patients"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Appointments"
            value={stats?.todayAppointments || 0}
            icon={<CalendarMonth />}
            color="warning"
            subtitle="Scheduled today"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="This Month"
            value={stats?.monthAppointments || 0}
            icon={<MedicalServices />}
            color="success"
            subtitle="Appointments this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pending Invoices"
            value={stats?.pendingInvoices || 0}
            icon={<Receipt />}
            color="error"
            subtitle="Awaiting payment"
          />
        </Grid>
      </Grid>

      {user?.role === 'admin' && (
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Monthly Revenue"
              value={`$${(stats?.monthRevenue || 0).toLocaleString()}`}
              icon={<TrendingUp />}
              color="info"
              subtitle="Collected this month"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Total Dentists"
              value={stats?.totalDentists || 0}
              icon={<People />}
              color="secondary"
              subtitle="Active dentists"
            />
          </Grid>
        </Grid>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              Upcoming Appointments
            </Typography>
            <Button size="small" onClick={() => navigate('/appointments')}>
              View All
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Dentist</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats?.recentAppointments?.length > 0 ? (
                  stats.recentAppointments.map((apt) => (
                    <TableRow key={apt._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {apt.patient?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {apt.patient?.patientId}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{apt.dentist?.name}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(apt.startTime), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(apt.startTime), 'hh:mm a')}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{apt.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={apt.status}
                          size="small"
                          color={statusColors[apt.status] || 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">No upcoming appointments</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
