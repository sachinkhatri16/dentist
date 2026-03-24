import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tab,
  Tabs,
} from '@mui/material';
import { ArrowBack, CalendarMonth, MedicalServices, Receipt } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import api from '../../services/api';

const statusColors = {
  scheduled: 'default',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'error',
};

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [patRes, aptRes, mrRes, invRes] = await Promise.all([
          api.get(`/patients/${id}`),
          api.get('/appointments', { params: { patient: id, limit: 20 } }),
          api.get('/medical-records', { params: { patient: id, limit: 20 } }),
          api.get('/billing', { params: { patient: id, limit: 20 } }).catch(() => ({ data: { invoices: [] } })),
        ]);
        setPatient(patRes.data);
        setAppointments(aptRes.data.appointments);
        setMedicalRecords(mrRes.data.records);
        setInvoices(invRes.data.invoices);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (!patient) return <Typography>Patient not found</Typography>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/patients')}>
          Back
        </Button>
        <Typography variant="h5" fontWeight={700}>
          Patient Details
        </Typography>
      </Box>

      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>Personal Information</Typography>
                <Chip label={patient.patientId} color="primary" size="small" />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {[
                  ['Full Name', patient.name],
                  ['Age', `${patient.age} years`],
                  ['Date of Birth', patient.dateOfBirth ? format(new Date(patient.dateOfBirth), 'MMM dd, yyyy') : '-'],
                  ['Gender', patient.gender],
                  ['Phone', patient.phone],
                  ['Email', patient.email || '-'],
                  ['Blood Type', patient.bloodType || '-'],
                  ['City', patient.address?.city || '-'],
                ].map(([label, value]) => (
                  <Grid item xs={6} key={label}>
                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                    <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>{value}</Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Medical Information</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">Allergies</Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                  {patient.allergies?.length > 0
                    ? patient.allergies.map((a) => <Chip key={a} label={a} size="small" color="error" variant="outlined" />)
                    : <Typography variant="body2">None reported</Typography>}
                </Box>
              </Box>
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">Medical History</Typography>
                <Typography variant="body2" mt={0.5}>{patient.medicalHistory || 'No medical history recorded'}</Typography>
              </Box>
              {patient.emergencyContact?.name && (
                <Box>
                  <Typography variant="caption" color="text.secondary">Emergency Contact</Typography>
                  <Typography variant="body2" fontWeight={500}>{patient.emergencyContact.name}</Typography>
                  <Typography variant="caption">{patient.emergencyContact.relationship} · {patient.emergencyContact.phone}</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(e, v) => setTab(v)}>
            <Tab icon={<CalendarMonth />} iconPosition="start" label={`Appointments (${appointments.length})`} />
            <Tab icon={<MedicalServices />} iconPosition="start" label={`Medical Records (${medicalRecords.length})`} />
            <Tab icon={<Receipt />} iconPosition="start" label={`Invoices (${invoices.length})`} />
          </Tabs>
        </Box>
        <CardContent>
          {tab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Dentist</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt._id} hover>
                      <TableCell>{apt.appointmentId}</TableCell>
                      <TableCell>
                        {format(new Date(apt.startTime), 'MMM dd, yyyy hh:mm a')}
                      </TableCell>
                      <TableCell>{apt.dentist?.name}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{apt.type}</TableCell>
                      <TableCell>
                        <Chip label={apt.status} size="small" color={statusColors[apt.status] || 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {appointments.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center"><Typography color="text.secondary">No appointments</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Record ID</TableCell>
                    <TableCell>Visit Date</TableCell>
                    <TableCell>Dentist</TableCell>
                    <TableCell>Diagnosis</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicalRecords.map((rec) => (
                    <TableRow key={rec._id} hover>
                      <TableCell>{rec.recordId}</TableCell>
                      <TableCell>{format(new Date(rec.visitDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{rec.dentist?.name}</TableCell>
                      <TableCell>{rec.diagnosis || '-'}</TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => navigate(`/medical-records/${rec._id}`)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {medicalRecords.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center"><Typography color="text.secondary">No records</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {tab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice ID</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv._id} hover>
                      <TableCell>{inv.invoiceId}</TableCell>
                      <TableCell>{format(new Date(inv.createdAt), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>${inv.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell>${inv.paidAmount?.toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip label={inv.status} size="small"
                          color={inv.status === 'paid' ? 'success' : inv.status === 'pending' ? 'warning' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow><TableCell colSpan={5} align="center"><Typography color="text.secondary">No invoices</Typography></TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default PatientDetail;
