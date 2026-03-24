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
  Switch,
  FormControlLabel,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';

const ROLES = ['admin', 'receptionist', 'dentist', 'patient'];

const roleColors = {
  admin: 'error',
  receptionist: 'warning',
  dentist: 'primary',
  patient: 'success',
};

const defaultForm = {
  name: '',
  email: '',
  password: '',
  role: 'receptionist',
  phone: '',
  specialization: '',
  licenseNumber: '',
  isActive: true,
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users', { params: { role: roleFilter || undefined } });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditUser(null);
    setForm(defaultForm);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ ...u, password: '' });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = { ...form };
      if (!payload.password) delete payload.password;
      if (editUser) {
        await api.put(`/auth/users/${editUser._id}`, payload);
      } else {
        await api.post('/auth/register', payload);
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/auth/users/${deleteDialog._id}`);
      setDeleteDialog(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>User Management</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add User</Button>
      </Box>

      <Card>
        <CardContent>
          <Box mb={2}>
            <TextField select size="small" label="Filter by Role" value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)} sx={{ width: 200 }}>
              <MenuItem value="">All Roles</MenuItem>
              {ROLES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>)}
            </TextField>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Login</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Chip label={u.role} size="small" color={roleColors[u.role] || 'default'}
                          sx={{ textTransform: 'capitalize' }} />
                      </TableCell>
                      <TableCell>{u.phone || '-'}</TableCell>
                      <TableCell>{u.specialization || '-'}</TableCell>
                      <TableCell>
                        <Chip label={u.isActive ? 'Active' : 'Inactive'} size="small"
                          color={u.isActive ? 'success' : 'default'} />
                      </TableCell>
                      <TableCell>
                        {u.lastLogin ? format(new Date(u.lastLogin), 'MMM dd, HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(u)}><Edit fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Deactivate">
                          <IconButton size="small" color="error" onClick={() => setDeleteDialog(u)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" py={3}>No users found</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name *" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email *" type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label={editUser ? 'New Password (leave blank to keep)' : 'Password *'}
                type="password" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Role" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLES.map((r) => <MenuItem key={r} value={r} sx={{ textTransform: 'capitalize' }}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Phone" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </Grid>
            {form.role === 'dentist' && (
              <>
                <Grid item xs={6}>
                  <TextField fullWidth label="Specialization" value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField fullWidth label="License Number" value={form.licenseNumber}
                    onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
                </Grid>
              </>
            )}
            {editUser && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />}
                  label="Active Account"
                />
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

      <Dialog open={Boolean(deleteDialog)} onClose={() => setDeleteDialog(null)}>
        <DialogTitle>Deactivate User</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to deactivate <strong>{deleteDialog?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Deactivate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
