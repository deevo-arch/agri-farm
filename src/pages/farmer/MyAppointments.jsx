import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Tabs, Tab, Grid, CircularProgress, Snackbar, Alert } from '@mui/material';
import { CalendarToday, CheckCircle, Cancel, Pending } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { farmerApi } from '../../api/farmerApi';

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try { const res = await farmerApi.getAppointments(); setAppointments(res.data || []); }
    catch { setSnackbar({ open: true, message: 'Failed to load appointments', severity: 'error' }); }
    finally { setLoading(false); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await farmerApi.cancelAppointment?.(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      setSnackbar({ open: true, message: 'Appointment cancelled', severity: 'success' });
    } catch { setSnackbar({ open: true, message: 'Failed to cancel', severity: 'error' }); }
  };

  const filtered = appointments.filter(a => 
    tab === 0 ? ['pending', 'confirmed'].includes(a.status) : ['completed', 'cancelled'].includes(a.status)
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle color="success" />;
      case 'pending': return <Pending color="warning" />;
      case 'completed': return <CheckCircle color="info" />;
      case 'cancelled': return <Cancel color="error" />;
      default: return <Pending />;
    }
  };

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>My Appointments</Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Upcoming" />
        <Tab label="Past" />
      </Tabs>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CalendarToday sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">{tab === 0 ? 'No upcoming appointments' : 'No past appointments'}</Typography>
          {tab === 0 && <Button variant="contained" component={Link} to="/farmer/vet-list" sx={{ mt: 2 }}>Book Appointment</Button>}
        </CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(apt => (
            <Grid item xs={12} key={apt.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{apt.vet_name || apt.vet?.full_name || 'Veterinarian'}</Typography>
                      <Typography variant="body2" color="text.secondary">{apt.vet_clinic || apt.vet?.clinic_name}</Typography>
                    </Box>
                    <Chip label={apt.status} icon={getStatusIcon(apt.status)} color={getStatusColor(apt.status)} size="small" />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarToday fontSize="small" color="text.secondary" />
                      <Typography variant="body2">{new Date(apt.date_time).toLocaleDateString()}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarToday fontSize="small" color="text.secondary" />
                      <Typography variant="body2">{new Date(apt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">{apt.animal_breed || apt.animal?.breed}</Typography>
                    </Box>
                  </Box>
                  {apt.reason && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Reason: {apt.reason}</Typography>}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {apt.status === 'pending' || apt.status === 'confirmed' ? (
                      <Button size="small" variant="outlined" color="error" onClick={() => handleCancel(apt.id)}>Cancel</Button>
                    ) : null}
                    <Button size="small" variant="text">View Details</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default MyAppointments;