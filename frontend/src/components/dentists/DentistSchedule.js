import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Schedule, Add } from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const DentistSchedule = () => {
  const { user } = useAuth();
  const [dentists, setDentists] = useState([]);
  const [selectedDentist, setSelectedDentist] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [todayApts, setTodayApts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    isAvailable: true,
    type: 'regular',
    workingHours: { start: '09:00', end: '17:00' },
    room: '',
    leaveReason: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit = ['admin', 'receptionist'].includes(user?.role);

  useEffect(() => {
    api.get('/dentists').then((res) => {
      setDentists(res.data);
      if (user?.role === 'dentist') {
        setSelectedDentist(user._id);
      } else if (res.data.length > 0) {
        setSelectedDentist(res.data[0]._id);
      }
    });
  }, [user]);

  useEffect(() => {
    if (!selectedDentist) return;
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    api.get(`/dentists/${selectedDentist}/schedule`, {
      params: { startDate: start.toISOString(), endDate: end.toISOString() },
    }).then((res) => setSchedules(res.data));

    api.get(`/dentists/${selectedDentist}/today`).then((res) => setTodayApts(res.data));
  }, [selectedDentist]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post(`/dentists/${selectedDentist}/schedule`, form);
      setDialogOpen(false);
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
      const res = await api.get(`/dentists/${selectedDentist}/schedule`, {
        params: { startDate: start.toISOString(), endDate: end.toISOString() },
      });
      setSchedules(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const selectedDentistInfo = dentists.find((d) => d._id === selectedDentist);

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Dentist Schedule</Typography>
        {canEdit && selectedDentist && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Add Schedule
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Select Dentist</Typography>
              <TextField
                fullWidth select label="Dentist"
                value={selectedDentist}
                onChange={(e) => setSelectedDentist(e.target.value)}
                disabled={user?.role === 'dentist'}
              >
                {dentists.map((d) => (
                  <MenuItem key={d._id} value={d._id}>
                    {d.name}
                    {d.specialization ? ` (${d.specialization})` : ''}
                  </MenuItem>
                ))}
              </TextField>

              {selectedDentistInfo && (
                <Box mt={3}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {selectedDentistInfo.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {selectedDentistInfo.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedDentistInfo.specialization || 'General Dentist'}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{selectedDentistInfo.email}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Schedule color="primary" />
                <Typography variant="h6">Today's Schedule</Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {todayApts.map((apt) => (
                      <TableRow key={apt._id} hover>
                        <TableCell>{format(new Date(apt.startTime), 'hh:mm a')}</TableCell>
                        <TableCell>{apt.patient?.name}</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{apt.type}</TableCell>
                        <TableCell>
                          <Chip label={apt.status} size="small"
                            color={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'error' : 'primary'} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {todayApts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography color="text.secondary">No appointments today</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Monthly Schedule</Typography>
              <Grid container spacing={1}>
                {schedules.map((s) => (
                  <Grid item xs={6} sm={4} key={s._id}>
                    <Box
                      p={1.5}
                      borderRadius={2}
                      bgcolor={s.isAvailable ? 'success.light' : 'error.light'}
                      border={1}
                      borderColor={s.isAvailable ? 'success.main' : 'error.main'}
                    >
                      <Typography variant="body2" fontWeight={600}>
                        {format(new Date(s.date), 'MMM dd, EEE')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.isAvailable ? `${s.workingHours?.start} - ${s.workingHours?.end}` : s.type}
                      </Typography>
                      {s.room && <Typography variant="caption" display="block">Room: {s.room}</Typography>}
                    </Box>
                  </Grid>
                ))}
                {schedules.length === 0 && (
                  <Grid item xs={12}>
                    <Typography color="text.secondary" textAlign="center" py={2}>
                      No schedule configured
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add/Update Schedule</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Date" type="date" value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Type" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value, isAvailable: e.target.value === 'regular' })}>
                <MenuItem value="regular">Regular Working Day</MenuItem>
                <MenuItem value="leave">Leave</MenuItem>
                <MenuItem value="holiday">Holiday</MenuItem>
                <MenuItem value="emergency">Emergency Only</MenuItem>
              </TextField>
            </Grid>
            {form.type === 'regular' && (
              <>
                <Grid item xs={6}>
                  <TextField fullWidth label="Start Time" type="time"
                    value={form.workingHours.start}
                    onChange={(e) => setForm({ ...form, workingHours: { ...form.workingHours, start: e.target.value } })}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="End Time" type="time"
                    value={form.workingHours.end}
                    onChange={(e) => setForm({ ...form, workingHours: { ...form.workingHours, end: e.target.value } })}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Room/Chair" value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })} />
                </Grid>
              </>
            )}
            {form.type !== 'regular' && (
              <Grid item xs={12}>
                <TextField fullWidth label="Reason" value={form.leaveReason}
                  onChange={(e) => setForm({ ...form, leaveReason: e.target.value })} />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DentistSchedule;
