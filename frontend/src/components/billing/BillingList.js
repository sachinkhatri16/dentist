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
  InputAdornment,
} from '@mui/material';
import { Add, Visibility, Edit, Search, Payment } from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../../services/api';

const STATUS_COLORS = {
  draft: 'default',
  pending: 'warning',
  partial: 'info',
  paid: 'success',
  overdue: 'error',
  cancelled: 'default',
};

const defaultItem = { description: '', procedure: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 };

const BillingList = () => {
  const [invoices, setInvoices] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(15);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(null);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [form, setForm] = useState({
    patient: '', dentist: '', items: [{ ...defaultItem }],
    taxRate: 0, discountAmount: 0, dueDate: '', notes: '',
  });
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/billing', {
        params: { status: statusFilter || undefined, page: page + 1, limit: rowsPerPage },
      });
      setInvoices(res.data.invoices);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    api.get('/patients', { params: { limit: 200 } }).then((res) => setPatients(res.data.patients));
    api.get('/dentists').then((res) => setDentists(res.data));
  }, []);

  const updateItem = (index, field, value) => {
    const items = [...form.items];
    items[index] = { ...items[index], [field]: value };
    if (field === 'unitPrice' || field === 'quantity' || field === 'discount') {
      const q = field === 'quantity' ? value : items[index].quantity;
      const p = field === 'unitPrice' ? value : items[index].unitPrice;
      const d = field === 'discount' ? value : items[index].discount;
      items[index].total = (q * p) - d;
    }
    setForm({ ...form, items });
  };

  const getSubtotal = () => form.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const getTotal = () => {
    const sub = getSubtotal();
    return sub + (sub * form.taxRate / 100) - form.discountAmount;
  };

  const handleCreate = async () => {
    setSaving(true);
    setError('');
    try {
      await api.post('/billing', form);
      setDialogOpen(false);
      fetchInvoices();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setSaving(false);
    }
  };

  const handlePayment = async () => {
    try {
      await api.put(`/billing/${paymentDialog._id}`, {
        paidAmount: paymentDialog.paidAmount + Number(payAmount),
        paymentMethod: payMethod,
      });
      setPaymentDialog(null);
      setPayAmount('');
      fetchInvoices();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Billing & Invoices</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => {
          setForm({ patient: '', dentist: '', items: [{ ...defaultItem }], taxRate: 0, discountAmount: 0, dueDate: '', notes: '' });
          setError('');
          setDialogOpen(true);
        }}>
          New Invoice
        </Button>
      </Box>

      <Card>
        <CardContent>
          <Box mb={2} display="flex" gap={2}>
            <TextField
              select label="Filter by Status" value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
              sx={{ width: 180 }} size="small"
            >
              <MenuItem value="">All</MenuItem>
              {['pending', 'partial', 'paid', 'overdue', 'cancelled'].map((s) => (
                <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
              ))}
            </TextField>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice ID</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Paid</TableCell>
                      <TableCell>Balance</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv._id} hover>
                        <TableCell>
                          <Chip label={inv.invoiceId} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{inv.patient?.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{inv.patient?.patientId}</Typography>
                        </TableCell>
                        <TableCell>{format(new Date(inv.createdAt), 'MMM dd, yyyy')}</TableCell>
                        <TableCell fontWeight={600}>${inv.totalAmount?.toFixed(2)}</TableCell>
                        <TableCell color="success.main">${inv.paidAmount?.toFixed(2)}</TableCell>
                        <TableCell color={inv.balanceDue > 0 ? 'error.main' : 'text.primary'}>
                          ${inv.balanceDue?.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Chip label={inv.status} size="small" color={STATUS_COLORS[inv.status] || 'default'}
                            sx={{ textTransform: 'capitalize' }} />
                        </TableCell>
                        <TableCell>
                          {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                            <Tooltip title="Record Payment">
                              <IconButton size="small" color="success" onClick={() => { setPaymentDialog(inv); setPayAmount(''); }}>
                                <Payment fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center">
                          <Typography color="text.secondary" py={3}>No invoices found</Typography>
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

      {/* Create Invoice Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Invoice</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6}>
              <TextField fullWidth select label="Patient *" value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                {patients.map((p) => <MenuItem key={p._id} value={p._id}>{p.name} ({p.patientId})</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth select label="Dentist" value={form.dentist}
                onChange={(e) => setForm({ ...form, dentist: e.target.value })}>
                {dentists.map((d) => <MenuItem key={d._id} value={d._id}>{d.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Due Date" type="date" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight={600} mb={1}>Items</Typography>
          {form.items.map((item, i) => (
            <Grid container spacing={1} key={i} mb={1} alignItems="center">
              <Grid item xs={4}>
                <TextField fullWidth size="small" label="Description" value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)} />
              </Grid>
              <Grid item xs={2}>
                <TextField fullWidth size="small" label="Qty" type="number" value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
              </Grid>
              <Grid item xs={2}>
                <TextField fullWidth size="small" label="Unit Price" type="number" value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} />
              </Grid>
              <Grid item xs={2}>
                <TextField fullWidth size="small" label="Discount" type="number" value={item.discount}
                  onChange={(e) => updateItem(i, 'discount', Number(e.target.value))} />
              </Grid>
              <Grid item xs={1}>
                <Typography fontWeight={600}>${item.total?.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={1}>
                {form.items.length > 1 && (
                  <IconButton size="small" onClick={() => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })}>
                    <Add sx={{ transform: 'rotate(45deg)' }} />
                  </IconButton>
                )}
              </Grid>
            </Grid>
          ))}
          <Button size="small" startIcon={<Add />} onClick={() => setForm({ ...form, items: [...form.items, { ...defaultItem }] })}>
            Add Item
          </Button>

          <Box mt={2} display="flex" justifyContent="flex-end" flexDirection="column" alignItems="flex-end" gap={1}>
            <Typography>Subtotal: <strong>${getSubtotal().toFixed(2)}</strong></Typography>
            <Box display="flex" gap={2}>
              <TextField size="small" label="Tax %" type="number" value={form.taxRate}
                onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} sx={{ width: 100 }} />
              <TextField size="small" label="Discount $" type="number" value={form.discountAmount}
                onChange={(e) => setForm({ ...form, discountAmount: Number(e.target.value) })} sx={{ width: 120 }} />
            </Box>
            <Typography variant="h6">Total: <strong>${getTotal().toFixed(2)}</strong></Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Create Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={Boolean(paymentDialog)} onClose={() => setPaymentDialog(null)}>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Balance due: <strong>${paymentDialog?.balanceDue?.toFixed(2)}</strong>
          </Typography>
          <TextField fullWidth label="Payment Amount" type="number" value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)} sx={{ mb: 2 }} />
          <TextField fullWidth select label="Payment Method" value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}>
            {['cash', 'card', 'insurance', 'online', 'other'].map((m) => (
              <MenuItem key={m} value={m} sx={{ textTransform: 'capitalize' }}>{m}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(null)}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handlePayment} disabled={!payAmount}>
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BillingList;
