import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
} from '@mui/material';
import { Add, Close } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const APPOINTMENT_TYPES = [
  'checkup', 'cleaning', 'filling', 'extraction', 'root-canal',
  'crown', 'bridge', 'implant', 'orthodontics', 'whitening', 'emergency', 'consultation', 'other',
];

const STATUS_COLORS = {
  scheduled: '#2196f3',
  confirmed: '#4caf50',
  'in-progress': '#ff9800',
  completed: '#9c27b0',
  cancelled: '#f44336',
  'no-show': '#795548',
};

const DEFAULT_APPOINTMENT_START_HOUR = '09:00';
const DEFAULT_APPOINTMENT_DURATION_MINUTES = 30;

const defaultForm = {
  dentist: '',
  startTime: '',
  endTime: '',
  type: 'checkup',
  reason: '',
  notes: '',
  room: '',
};

const AppointmentCalendar = () => {
  const { user } = useAuth();
  const calendarRef = useRef(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialog, setDetailDialog] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const canCreate = ['admin', 'receptionist'].includes(user?.role);

  const fetchAppointments = useCallback(async () => {
    if (!dateRange.startDate) return;
    setLoading(true);
    try {
      const params = { ...dateRange, limit: 500 };
      if (user?.role === 'dentist') params.dentist = user._id;
      const res = await api.get('/appointments', { params });
      setAppointments(res.data.appointments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange, user]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    if (canCreate) {
      api.get('/patients', { params: { limit: 200 } }).then((res) => setPatients(res.data.patients));
      api.get('/dentists').then((res) => setDentists(res.data));
    }
  }, [canCreate]);

  const calendarEvents = appointments.map((apt) => ({
    id: apt._id,
    title: `${apt.patient?.name} - ${apt.type}`,
    start: apt.startTime,
    end: apt.endTime,
    backgroundColor: STATUS_COLORS[apt.status] || '#2196f3',
    borderColor: STATUS_COLORS[apt.status] || '#2196f3',
    extendedProps: { appointment: apt },
  }));

  const handleDateClick = (info) => {
    if (!canCreate) return;
    const start = new Date(info.dateStr + `T${DEFAULT_APPOINTMENT_START_HOUR}:00`);
    const end = new Date(start.getTime() + DEFAULT_APPOINTMENT_DURATION_MINUTES * 60 * 1000);
    setForm({
      ...defaultForm,
      startTime: format(start, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm"),
      dentist: user?.role === 'dentist' ? user._id : '',
    });
    setEditMode(false);
    setError('');
    setDialogOpen(true);
  };

  const handleEventClick = (info) => {
    const apt = info.event.extendedProps.appointment;
    setDetailDialog(apt);
  };

  const handleDatesSet = (info) => {
    setDateRange({
      startDate: info.startStr,
      endDate: info.endStr,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      if (editMode && detailDialog) {
        await api.put(`/appointments/${detailDialog._id}`, form);
      } else {
        await api.post('/appointments', form);
      }
      setDialogOpen(false);
      setDetailDialog(null);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save appointment');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      await api.put(`/appointments/${detailDialog._id}`, {
        status: 'cancelled',
        cancellationReason: 'Cancelled by staff',
      });
      setDetailDialog(null);
      fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (apt) => {
    setForm({
      patient: apt.patient?._id || '',
      dentist: apt.dentist?._id || '',
      startTime: format(new Date(apt.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(apt.endTime), "yyyy-MM-dd'T'HH:mm"),
      type: apt.type || 'checkup',
      reason: apt.reason || '',
      notes: apt.notes || '',
      room: apt.room || '',
    });
    setEditMode(true);
    setError('');
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Appointment Calendar</Typography>
        <Box display="flex" gap={1} alignItems="center">
          {loading && <CircularProgress size={20} />}
          {canCreate && (
            <Button variant="contained" startIcon={<Add />} onClick={() => {
              setForm({ ...defaultForm, dentist: user?.role === 'dentist' ? user._id : '' });
              setEditMode(false);
              setError('');
              setDialogOpen(true);
            }}>
              Book Appointment
            </Button>
          )}
        </Box>
      </Box>

      {/* Legend */}
      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <Chip key={status} label={status} size="small"
            sx={{ bgcolor: color, color: 'white', textTransform: 'capitalize', fontWeight: 500 }} />
        ))}
      </Box>

      <Card>
        <CardContent>
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            height="700px"
            slotMinTime="07:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            nowIndicator
            editable={false}
            eventDisplay="block"
          />
        </CardContent>
      </Card>

      {/* Create/Edit Appointment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Appointment' : 'Book Appointment'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth select label="Patient *" value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                {patients.map((p) => (
                  <MenuItem key={p._id} value={p._id}>{p.name} ({p.patientId})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Dentist *" value={form.dentist}
                onChange={(e) => setForm({ ...form, dentist: e.target.value })}
                disabled={user?.role === 'dentist'}>
                {dentists.map((d) => (
                  <MenuItem key={d._id} value={d._id}>{d.name}{d.specialization ? ` - ${d.specialization}` : ''}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Start Time *" type="datetime-local"
                value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="End Time *" type="datetime-local"
                value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Type" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {APPOINTMENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t} sx={{ textTransform: 'capitalize' }}>{t}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Room/Chair" value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Reason for Visit" value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Notes" value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Appointment Detail Dialog */}
      {detailDialog && (
        <Dialog open={Boolean(detailDialog)} onClose={() => setDetailDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Appointment Details
              <IconButton size="small" onClick={() => setDetailDialog(null)}><Close /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {[
                ['Appointment ID', detailDialog.appointmentId],
                ['Patient', `${detailDialog.patient?.name} (${detailDialog.patient?.patientId})`],
                ['Dentist', detailDialog.dentist?.name],
                ['Start Time', format(new Date(detailDialog.startTime), 'MMM dd, yyyy hh:mm a')],
                ['End Time', format(new Date(detailDialog.endTime), 'hh:mm a')],
                ['Type', detailDialog.type],
                ['Room', detailDialog.room || '-'],
                ['Reason', detailDialog.reason || '-'],
                ['Notes', detailDialog.notes || '-'],
              ].map(([label, value]) => (
                <Grid item xs={6} key={label}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{value}</Typography>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box>
                  <Chip label={detailDialog.status} size="small"
                    sx={{ bgcolor: STATUS_COLORS[detailDialog.status], color: 'white', textTransform: 'capitalize' }} />
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            {canCreate && detailDialog.status !== 'cancelled' && (
              <>
                <Button color="error" onClick={handleCancel}>Cancel Appointment</Button>
                <Button onClick={() => { openEdit(detailDialog); }}>Edit</Button>
              </>
            )}
            <Button variant="contained" onClick={() => setDetailDialog(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default AppointmentCalendar;
