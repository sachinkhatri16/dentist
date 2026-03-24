import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Chip,
  Divider,
} from '@mui/material';
import {
  LocalHospital,
  CalendarMonth,
  MedicalServices,
  Security,
  Star,
  Phone,
  Email,
  LocationOn,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const services = [
  { title: 'General Dentistry', desc: 'Comprehensive oral health care including cleanings, fillings, and preventive treatments.' },
  { title: 'Cosmetic Dentistry', desc: 'Teeth whitening, veneers, and smile makeovers to enhance your confidence.' },
  { title: 'Orthodontics', desc: 'Braces and clear aligners for a perfectly aligned, beautiful smile.' },
  { title: 'Oral Surgery', desc: 'Expert surgical procedures including extractions, implants, and more.' },
  { title: 'Pediatric Dentistry', desc: 'Gentle, child-friendly dental care in a comfortable environment.' },
  { title: 'Emergency Care', desc: '24/7 emergency dental services for urgent dental problems.' },
];

const features = [
  'Online appointment booking',
  'Electronic medical records',
  'X-ray & imaging management',
  'Multi-dentist scheduling',
  'Automated reminders',
  'Billing & insurance tracking',
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          bgcolor: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center" py={2}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <LocalHospital sx={{ color: 'primary.main', fontSize: 32 }} />
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary" lineHeight={1.2}>
                  DentiCare
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Dental Clinic
                </Typography>
              </Box>
            </Box>
            <Box display="flex" gap={2}>
              <Button onClick={() => navigate('/login')}>Sign In</Button>
              <Button variant="contained" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #42a5f5 100%)',
          color: 'white',
          py: { xs: 8, md: 14 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label="🦷 Modern Dental Care"
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', mb: 2 }}
              />
              <Typography variant="h2" fontWeight={800} mb={2} sx={{ fontSize: { xs: '2.2rem', md: '3.2rem' } }}>
                Your Smile, Our Priority
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 4, fontWeight: 400 }}>
                Advanced dental clinic management system. Streamline appointments, medical records, and patient care all in one place.
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.dark',
                    '&:hover': { bgcolor: 'grey.100' },
                    py: 1.5,
                    px: 4,
                  }}
                >
                  Book Appointment
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }, py: 1.5, px: 4 }}
                >
                  Staff Login
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                {[
                  { icon: <CalendarMonth sx={{ fontSize: 40 }} />, label: 'Smart Scheduling', desc: 'Conflict-free bookings' },
                  { icon: <MedicalServices sx={{ fontSize: 40 }} />, label: 'Medical Records', desc: 'Complete EMR system' },
                  { icon: <Security sx={{ fontSize: 40 }} />, label: 'Secure & Private', desc: 'HIPAA compliant' },
                  { icon: <Star sx={{ fontSize: 40 }} />, label: 'Multi-Role Access', desc: 'Admin, dentist, staff' },
                ].map((item) => (
                  <Grid item xs={6} key={item.label}>
                    <Box
                      p={3}
                      borderRadius={3}
                      sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)' }}
                      textAlign="center"
                    >
                      {item.icon}
                      <Typography variant="subtitle1" fontWeight={600} mt={1}>{item.label}</Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>{item.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="overline" color="primary" fontWeight={600}>Our Services</Typography>
            <Typography variant="h3" fontWeight={700} mt={1}>
              Complete Dental Care
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={2} maxWidth={600} mx="auto">
              From routine checkups to advanced procedures, our team provides comprehensive dental care for the whole family.
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.title}>
                <Card sx={{ height: '100%', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' } }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        bgcolor: 'primary.light',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                      }}
                    >
                      <LocalHospital sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} mb={1}>{service.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{service.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 10, bgcolor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" color="primary" fontWeight={600}>Management System</Typography>
              <Typography variant="h3" fontWeight={700} mt={1} mb={3}>
                Everything you need to run your clinic
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={4}>
                DentiCare provides a complete suite of tools for dental practices of all sizes. Manage patients, appointments, records, and billing all from one intuitive platform.
              </Typography>
              <Grid container spacing={2}>
                {features.map((f) => (
                  <Grid item xs={12} sm={6} key={f}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                      <Typography variant="body2">{f}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button variant="contained" size="large" sx={{ mt: 4 }} onClick={() => navigate('/login')}>
                Get Started Free
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                  borderRadius: 4,
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h2" fontWeight={800} color="primary" mb={1}>
                  98%
                </Typography>
                <Typography variant="h6" color="text.secondary" mb={3}>
                  Patient Satisfaction Rate
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                  {[['10,000+', 'Patients'], ['50+', 'Dentists'], ['200+', 'Daily Appointments']].map(([num, label]) => (
                    <Grid item xs={4} key={label}>
                      <Typography variant="h5" fontWeight={700} color="primary">{num}</Typography>
                      <Typography variant="caption" color="text.secondary">{label}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 10, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={700}>Contact Us</Typography>
            <Typography variant="body1" color="text.secondary" mt={2}>
              We're here to help with all your dental needs
            </Typography>
          </Box>
          <Grid container spacing={4} justifyContent="center">
            {[
              { icon: <Phone />, title: 'Phone', info: '+1 (555) 123-4567' },
              { icon: <Email />, title: 'Email', info: 'info@denticare.com' },
              { icon: <LocationOn />, title: 'Address', info: '123 Dental Street, Health City, HC 12345' },
            ].map((contact) => (
              <Grid item xs={12} sm={4} key={contact.title} textAlign="center">
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: 'primary.main',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: 'white',
                  }}
                >
                  {contact.icon}
                </Box>
                <Typography variant="h6" fontWeight={600}>{contact.title}</Typography>
                <Typography variant="body2" color="text.secondary">{contact.info}</Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#1a2234', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box display="flex" alignItems="center" gap={1}>
              <LocalHospital />
              <Typography variant="h6" fontWeight={700}>DentiCare</Typography>
            </Box>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} DentiCare. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
