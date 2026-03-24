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
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { ArrowBack, Upload, Add, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const MedicalRecordDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const canEdit = ['admin', 'dentist'].includes(user?.role);

  const fetchRecord = async () => {
    try {
      const res = await api.get(`/medical-records/${id}`);
      setRecord(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append('files', f));
      await api.post(`/medical-records/${id}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadDialog(false);
      setSelectedFiles([]);
      fetchRecord();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (!record) return <Typography>Record not found</Typography>;

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/medical-records')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Medical Record</Typography>
        <Chip label={record.recordId} color="primary" variant="outlined" />
      </Box>

      <Grid container spacing={3}>
        {/* Patient Info */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" mb={2}>Patient Information</Typography>
              <Divider sx={{ mb: 2 }} />
              {[
                ['Name', record.patient?.name],
                ['Patient ID', record.patient?.patientId],
                ['Blood Type', record.patient?.bloodType || '-'],
                ['Visit Date', format(new Date(record.visitDate), 'MMM dd, yyyy')],
                ['Dentist', record.dentist?.name],
                ['Appointment', record.appointment?.appointmentId || '-'],
              ].map(([label, value]) => (
                <Box key={label} mb={1.5}>
                  <Typography variant="caption" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" fontWeight={500}>{value}</Typography>
                </Box>
              ))}
              {record.patient?.allergies?.length > 0 && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary">Allergies</Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                    {record.patient.allergies.map((a) => (
                      <Chip key={a} label={a} size="small" color="error" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Clinical Details */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" mb={2}>Clinical Details</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Chief Complaint</Typography>
                  <Typography variant="body2">{record.chiefComplaint || '-'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Diagnosis</Typography>
                  <Typography variant="body2">{record.diagnosis || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Clinical Notes</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{record.clinicalNotes || '-'}</Typography>
                </Grid>
                {record.followUpDate && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Follow-up Date</Typography>
                    <Typography variant="body2" color="primary" fontWeight={500}>
                      {format(new Date(record.followUpDate), 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Procedures */}
          {record.procedures?.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>Procedures</Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  {record.procedures.map((proc, i) => (
                    <ListItem key={i} divider>
                      <ListItemText
                        primary={proc.name}
                        secondary={[proc.tooth && `Tooth: ${proc.tooth}`, proc.notes].filter(Boolean).join(' | ')}
                      />
                      <Typography variant="body2" fontWeight={600}>${proc.cost?.toFixed(2) || '0.00'}</Typography>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Prescriptions */}
          {record.prescriptions?.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>Prescriptions</Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  {record.prescriptions.map((presc, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Box p={2} bgcolor="grey.50" borderRadius={2}>
                        <Typography variant="subtitle2" fontWeight={600}>{presc.medication}</Typography>
                        <Typography variant="body2">{presc.dosage}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {presc.frequency} · {presc.duration}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Attachments & X-Rays</Typography>
                {canEdit && (
                  <Button startIcon={<Upload />} size="small" onClick={() => setUploadDialog(true)}>
                    Upload
                  </Button>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              {record.attachments?.length > 0 ? (
                <Grid container spacing={1}>
                  {record.attachments.map((att, i) => (
                    <Grid item xs={12} sm={6} key={i}>
                      <Box p={1.5} border={1} borderColor="grey.300" borderRadius={2} display="flex" alignItems="center">
                        <Box flex={1}>
                          <Typography variant="body2" fontWeight={500} noWrap>{att.originalName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(att.size / 1024).toFixed(1)} KB · {format(new Date(att.uploadedAt), 'MMM dd')}
                          </Typography>
                        </Box>
                        <Button size="small" href={`/uploads/${att.filename}`} target="_blank">View</Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="text.secondary" textAlign="center" py={2}>No attachments</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)}>
        <DialogTitle>Upload Files</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Typography variant="body2" color="text.secondary" mb={2}>
            Supported: images, PDFs, Word documents (max 10MB each)
          </Typography>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
          />
          {selectedFiles.length > 0 && (
            <Box mt={2}>
              {selectedFiles.map((f, i) => (
                <Chip key={i} label={f.name} size="small" sx={{ m: 0.5 }} />
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpload} disabled={uploading || !selectedFiles.length}>
            {uploading ? <CircularProgress size={20} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MedicalRecordDetail;
