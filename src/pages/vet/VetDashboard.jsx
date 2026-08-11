import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, CircularProgress, Tabs, Tab } from '@mui/material';
import { CalendarToday, CheckCircle, MedicalServices, Person } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { vetApi } from '../../api/vetApi';

const VetDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try { const res = await vetApi.getAppointments(); setAppointments(res.data || []); }
    catch { console.error('Failed to load appointments'); }
    finally { setLoading(false); }
  };

  const confirmAppointment = async (id) => {
    try {
      await vetApi.confirmAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch { console.error('Failed to confirm'); }
  };

  const todayAppointments = appointments.filter(a => {
    const today = new Date().toDateString();
    return new Date(a.date_time).toDateString() === today;
  });

  const stats = [
    { label: "Today's Appointments", value: todayAppointments.length, icon: <CalendarToday />, color: 'primary' },
    { label: 'Pending Confirmation', value: appointments.filter(a => a.status === 'pending').length, icon: <MedicalServices />, color: 'warning' },
    { label: 'Completed Today', value: appointments.filter(a => a.status === 'completed' && new Date(a.date_time).toDateString() === new Date().toDateString()).length, icon: <CheckCircle />, color: 'success' },
    { label: 'Total Patients', value: new Set(appointments.map(a => a.animal_id)).size, icon: <Person />, color: 'info' },
  ];

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>Dashboard</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: `${stat.color}.light`, borderRadius: 2, color: `${stat.color}.main` }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Today's Appointments</Typography>
          <Button size="small" component={Link} to="/vet/appointments">View All</Button>
        </Box>
        {todayAppointments.length === 0 ? (
          <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
            <MedicalServices sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No appointments today</Typography>
          </CardContent></Card>
        ) : (
          <Grid container spacing={2}>
            {todayAppointments.map(apt => (
              <Grid item xs={12} sm={6} key={apt.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>{apt.animal_breed || apt.animal?.breed}</Typography>
                        <Typography variant="body2" color="text.secondary">{apt.farmer_name || apt.farmer?.full_name}</Typography>
                      </Box>
                      <Chip label={apt.status} size="small" color={apt.status === 'confirmed' ? 'success' : 'warning'} />
                    </Box>
                    <Typography variant="body2">{new Date(apt.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                    <Typography variant="body2" color="text.secondary">{apt.reason}</Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                      {apt.status === 'pending' && <Button size="small" variant="contained" onClick={() => confirmAppointment(apt.id)}>Confirm</Button>}
                      <Button size="small" variant="outlined" component={Link} to={`/vet/appointments/${apt.id}`}>View</Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default VetDashboard;