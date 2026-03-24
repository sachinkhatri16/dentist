import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  Grid,
} from '@mui/material';
import { format } from 'date-fns';
import api from '../../services/api';

const ACTION_COLORS = {
  login: 'success',
  logout: 'default',
  login_failed: 'error',
  create: 'primary',
  update: 'info',
  delete: 'error',
  view: 'default',
  export: 'secondary',
  upload: 'primary',
  password_change: 'warning',
};

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const [actionFilter, setActionFilter] = useState('');
  const [resourceFilter, setResourceFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit-logs', {
        params: {
          action: actionFilter || undefined,
          resource: resourceFilter || undefined,
          page: page + 1,
          limit: rowsPerPage,
        },
      });
      setLogs(res.data.logs);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, actionFilter, resourceFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Audit Logs</Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small" label="Filter by Action"
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All Actions</MenuItem>
                {['login', 'logout', 'login_failed', 'create', 'update', 'delete', 'view', 'upload', 'password_change'].map((a) => (
                  <MenuItem key={a} value={a} sx={{ textTransform: 'capitalize' }}>{a.replace('_', ' ')}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select fullWidth size="small" label="Filter by Resource"
                value={resourceFilter}
                onChange={(e) => { setResourceFilter(e.target.value); setPage(0); }}
              >
                <MenuItem value="">All Resources</MenuItem>
                {['Auth', 'User', 'Patient', 'Appointment', 'MedicalRecord', 'Invoice', 'Schedule'].map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Resource</TableCell>
                      <TableCell>Resource ID</TableCell>
                      <TableCell>IP Address</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log._id} hover>
                        <TableCell>
                          <Typography variant="caption">
                            {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{log.user?.name || log.userEmail || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">{log.user?.role}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.action.replace('_', ' ')}
                            size="small"
                            color={ACTION_COLORS[log.action] || 'default'}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </TableCell>
                        <TableCell>{log.resource}</TableCell>
                        <TableCell>
                          <Typography variant="caption">{log.resourceId || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{log.ipAddress || '-'}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.status}
                            size="small"
                            color={log.status === 'success' ? 'success' : 'error'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" py={2}>No audit logs found</Typography>
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
                rowsPerPageOptions={[20]}
              />
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogs;
