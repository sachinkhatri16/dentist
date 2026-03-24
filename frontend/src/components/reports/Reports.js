import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  TextField,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format, subMonths } from 'date-fns';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const COLORS = ['#1976d2', '#4caf50', '#ff9800', '#f44336', '#9c27b0', '#00bcd4'];

const Reports = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [aptStats, setAptStats] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [workload, setWorkload] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = { startDate: new Date(dateRange.startDate).toISOString(), endDate: new Date(dateRange.endDate).toISOString() };
      const [aptRes, ...rest] = await Promise.all([
        api.get('/reports/appointments', { params }),
        user?.role === 'admin' ? api.get('/reports/revenue', { params }) : Promise.resolve({ data: null }),
        user?.role === 'admin' ? api.get('/reports/dentist-workload', { params }) : Promise.resolve({ data: [] }),
      ]);
      setAptStats(aptRes.data);
      if (rest[0].data) setRevenue(rest[0].data);
      if (rest[1].data) setWorkload(rest[1].data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Reports & Analytics</Typography>

      {/* Date Range */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Start Date" type="date" size="small"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date" type="date" size="small"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <Button variant="contained" onClick={fetchReports} disabled={loading}>
              Apply Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={3}>
          {/* Appointments by Status */}
          {aptStats?.byStatus?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>Appointments by Status</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={aptStats.byStatus}
                        dataKey="count"
                        nameKey="_id"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ _id, count }) => `${_id}: ${count}`}
                      >
                        {aptStats.byStatus.map((entry, index) => (
                          <Cell key={entry._id} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Appointments by Type */}
          {aptStats?.byType?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>Appointments by Type</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={aptStats.byType}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1976d2" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Daily Appointments Trend */}
          {aptStats?.daily?.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>Daily Appointments Trend</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={aptStats.daily}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#1976d2" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Revenue Charts (Admin only) */}
          {user?.role === 'admin' && revenue?.monthly?.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>Monthly Revenue</Typography>
                  <Grid container spacing={2} mb={2}>
                    {[
                      ['Total Billed', `$${(revenue.total?.totalBilled || 0).toLocaleString()}`],
                      ['Collected', `$${(revenue.total?.totalCollected || 0).toLocaleString()}`],
                      ['Pending', `$${(revenue.total?.totalPending || 0).toLocaleString()}`],
                    ].map(([label, value]) => (
                      <Grid item xs={4} key={label}>
                        <Box textAlign="center" p={2} bgcolor="grey.50" borderRadius={2}>
                          <Typography variant="caption" color="text.secondary">{label}</Typography>
                          <Typography variant="h6" fontWeight={700}>{value}</Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenue.monthly}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="_id" />
                      <YAxis />
                      <Tooltip formatter={(val) => `$${val.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="totalBilled" name="Billed" fill="#1976d2" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="totalCollected" name="Collected" fill="#4caf50" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Dentist Workload */}
          {user?.role === 'admin' && workload.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>Dentist Workload</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={workload} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#1976d2" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="completed" name="Completed" fill="#4caf50" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Appointments by Dentist */}
          {aptStats?.byDentist?.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" mb={2}>Appointments by Dentist</Typography>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={aptStats.byDentist} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#9c27b0" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default Reports;
