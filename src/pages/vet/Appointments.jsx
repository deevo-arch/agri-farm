import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Grid, CircularProgress, Tabs, Tab, TextField } from '@mui/material';
import { CalendarToday, CheckCircle, Cancel, FilterList, Search } from '@mui/icons-material';
import { vetApi } from '../../api/vetApi';

const VetAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try { const res = await vetApi.getAppointments(); setAppointments(res.data || []); }
    catch { console.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const confirmAppointment = async (id) => {
    try {
      await vetApi.confirmAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
    } catch { console.error('Failed to confirm'); }
  };

  const filtered = appointments.filter(a => {
    const statusMatch = tab === 0 ? ['pending', 'confirmed'].includes(a.status) : ['completed', 'cancelled'].includes(a.status);
    const searchMatch = !search || 
      a.farmer_name?.toLowerCase().includes(search.toLowerCase()) ||
      a.animal_breed?.toLowerCase().includes(search.toLowerCase()) ||
      a.animal_unique_id?.toLowerCase().includes(search.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" color="primary.main">Appointments</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField placeholder="Search..." size="small" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <Search /> }} sx={{ width: 250 }} />
        </Box>
      </Box>

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
        </CardContent></Card>
      ) : (
        <Grid container spacing={2}>
          {filtered.map(apt => (
            <Grid item xs={12} key={apt.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>{apt.animal_breed || apt.animal?.breed}</Typography>
                      <Typography variant="body2" color="text.secondary">{apt.animal_unique_id || apt.animal?.unique_animal_id}</Typography>
                    </Box>
                    <Chip label={apt.status} size="small" color={getStatusColor(apt.status)} />
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
                      <Typography variant="body2">{apt.farmer_name || apt.farmer?.full_name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2">{apt.farm_name || apt.farmer?.farm_name}</Typography>
                    </Box>
                  </Box>
                  {apt.reason && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Reason: {apt.reason}</Typography>}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    {apt.status === 'pending' && <Button size="small" variant="contained" onClick={() => confirmAppointment(apt.id)}>Confirm</Button>}
                    {apt.status === 'confirmed' && <Button size="small" variant="outlined" color="success">Mark Complete</Button>}
                    <Button size="small" variant="text">View Details</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default VetAppointments;