import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
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
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  PersonAdd,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['male', 'female', 'other'];

const defaultForm = {
  name: '',
  dateOfBirth: '',
  gender: 'male',
  phone: '',
  email: '',
  address: { street: '', city: '', state: '', zipCode: '' },
  emergencyContact: { name: '', relationship: '', phone: '' },
  medicalHistory: '',
  allergies: '',
  bloodType: '',
  notes: '',
};

const PatientList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const canEdit = ['admin', 'receptionist'].includes(user?.role);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/patients', {
        params: { search, page: page + 1, limit: rowsPerPage },
      });
      setPatients(res.data.patients);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, page, rowsPerPage]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, 400);
    return () => clearTimeout(timer);
  }, [fetchPatients]);

  const openCreate = () => {
    setEditPatient(null);
    setForm(defaultForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (patient) => {
    setEditPatient(patient);
    setForm({
      ...patient,
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.split('T')[0] : '',
      allergies: patient.allergies?.join(', ') || '',
      address: patient.address || defaultForm.address,
      emergencyContact: patient.emergencyContact || defaultForm.emergencyContact,
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        allergies: form.allergies ? form.allergies.split(',').map((a) => a.trim()).filter(Boolean) : [],
      };
      if (editPatient) {
        await api.put(`/patients/${editPatient._id}`, payload);
      } else {
        await api.post('/patients', payload);
      }
      setDialogOpen(false);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/patients/${deleteDialog._id}`);
      setDeleteDialog(null);
      fetchPatients();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>
          Patients
        </Typography>
        {canEdit && (
          <Button variant="contained" startIcon={<PersonAdd />} onClick={openCreate}>
            Add Patient
          </Button>
        )}
      </Box>

      <Card>
        <CardContent>
          <Box mb={2}>
            <TextField
              placeholder="Search by name, email, phone, or ID..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
              }}
              sx={{ width: 360 }}
              size="small"
            />
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Patient ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Blood Type</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((p) => (
                      <TableRow key={p._id} hover>
                        <TableCell>
                          <Chip label={p.patientId} size="small" color="primary" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{p.name}</Typography>
                          {p.email && <Typography variant="caption" color="text.secondary">{p.email}</Typography>}
                        </TableCell>
                        <TableCell>{p.age} yrs</TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>{p.gender}</TableCell>
                        <TableCell>{p.phone}</TableCell>
                        <TableCell>{p.bloodType || '-'}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => navigate(`/patients/${p._id}`)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {canEdit && (
                            <>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => openEdit(p)}>
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => setDeleteDialog(p)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {patients.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" py={3}>No patients found</Typography>
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
                onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name *" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Date of Birth *" type="date"
                value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Gender *" value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                {GENDERS.map((g) => <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone *" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Blood Type" value={form.bloodType}
                onChange={(e) => setForm({ ...form, bloodType: e.target.value })}>
                <MenuItem value="">Select</MenuItem>
                {BLOOD_TYPES.map((bt) => <MenuItem key={bt} value={bt}>{bt}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="City" value={form.address?.city || ''}
                onChange={(e) => setForm({ ...form, address: { ...form.address, city: e.target.value } })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="State" value={form.address?.state || ''}
                onChange={(e) => setForm({ ...form, address: { ...form.address, state: e.target.value } })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Allergies (comma-separated)" value={form.allergies}
                onChange={(e) => setForm({ ...form, allergies: e.target.value })}
                placeholder="e.g., Penicillin, Latex, Aspirin" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={3} label="Medical History"
                value={form.medicalHistory} onChange={(e) => setForm({ ...form, medicalHistory: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Emergency Contact Name" value={form.emergencyContact?.name || ''}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Relationship" value={form.emergencyContact?.relationship || ''}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relationship: e.target.value } })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Emergency Phone" value={form.emergencyContact?.phone || ''}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })} />
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to deactivate patient <strong>{deleteDialog?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PatientList;
