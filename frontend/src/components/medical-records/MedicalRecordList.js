import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import { Add, Visibility, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const defaultForm = {
  patient: '',
  dentist: '',
  appointment: '',
  visitDate: format(new Date(), 'yyyy-MM-dd'),
  chiefComplaint: '',
  diagnosis: '',
  clinicalNotes: '',
  followUpDate: '',
  procedures: [],
  prescriptions: [],
};

const MedicalRecordList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);

  const canCreate = ['admin', 'dentist'].includes(user?.role);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: page + 1, limit: rowsPerPage };
      if (user?.role === 'dentist') params.dentist = user._id;
      const res = await api.get('/medical-records', { params });
      setRecords(res.data.records);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, user]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    api.get('/patients', { params: { limit: 200 } }).then((res) => setPatients(res.data.patients));
    api.get('/dentists').then((res) => setDentists(res.data));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (user?.role === 'dentist') payload.dentist = user._id;
      await api.post('/medical-records', payload);
      setDialogOpen(false);
      fetchRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Medical Records</Typography>
        {canCreate && (
          <Button variant="contained" startIcon={<Add />} onClick={() => {
            setForm({ ...defaultForm, dentist: user?.role === 'dentist' ? user._id : '' });
            setError('');
            setDialogOpen(true);
          }}>
            New Record
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Record ID</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Dentist</TableCell>
                      <TableCell>Visit Date</TableCell>
                      <TableCell>Diagnosis</TableCell>
                      <TableCell>Procedures</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {records.map((rec) => (
                      <TableRow key={rec._id} hover>
                        <TableCell>
                          <Chip label={rec.recordId} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{rec.patient?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{rec.patient?.patientId}</Typography>
                        </TableCell>
                        <TableCell>{rec.dentist?.name}</TableCell>
                        <TableCell>{format(new Date(rec.visitDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {rec.diagnosis || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`${rec.procedures?.length || 0} procedure(s)`} size="small" />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View">
                            <IconButton size="small" onClick={() => navigate(`/medical-records/${rec._id}`)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {records.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" py={3}>No medical records found</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(e, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[15]}
              />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Medical Record</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Patient *" value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                {patients.map((p) => (
                  <MenuItem key={p._id} value={p._id}>{p.name} ({p.patientId})</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Dentist *" value={form.dentist}
                onChange={(e) => setForm({ ...form, dentist: e.target.value })}
                disabled={user?.role === 'dentist'}>
                {dentists.map((d) => (
                  <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Visit Date" type="date" value={form.visitDate}
                onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Follow-up Date" type="date" value={form.followUpDate}
                onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Chief Complaint" value={form.chiefComplaint}
                onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Diagnosis" value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Clinical Notes" value={form.clinicalNotes}
                onChange={(e) => setForm({ ...form, clinicalNotes: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Create Record'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicalRecordList;
