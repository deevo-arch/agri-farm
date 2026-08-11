import React from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, Avatar, IconButton } from '@mui/material';
import { Add, Pets, MedicalServices, CalendarToday, Visibility, Edit } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const FarmerDashboard = () => {
  const { user } = useAuth();
  const stats = [
    { label: 'Total Animals', value: '24', icon: <Pets />, color: 'primary' },
    { label: 'Upcoming Appointments', value: '3', icon: <CalendarToday />, color: 'secondary' },
    { label: 'Pending Vet Visits', value: '1', icon: <MedicalServices />, color: 'warning' },
    { label: 'Milk Batches', value: '12', icon: <Visibility />, color: 'success' },
  ];

  const recentAnimals = [
    { id: 1, uniqueId: 'ANM-001', breed: 'Holstein', status: 'Healthy' },
    { id: 2, uniqueId: 'ANM-002', breed: 'Jersey', status: 'Check-up Due' },
    { id: 3, uniqueId: 'ANM-003', breed: 'Gir', status: 'Healthy' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary.main">Dashboard</Typography>
        <Button variant="contained" startIcon={<Add />} component={Link} to="/farmer/add-animal">Add Animal</Button>
      </Box>

      <Typography variant="h6" sx={{ mb: 2 }}>Welcome back, {user?.full_name}!</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Farm: {user?.farm_name}</Typography>

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
                  <Avatar sx={{ bgcolor: `${stat.color}.light`, color: `${stat.color}.main` }}>{stat.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recent Animals</Typography>
          <Button size="small" component={Link} to="/farmer/animals">View All</Button>
        </Box>
        <Grid container spacing={2}>
          {recentAnimals.map((animal) => (
            <Grid item xs={12} sm={4} key={animal.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{animal.breed}</Typography>
                      <Typography variant="body2" color="text.secondary">{animal.uniqueId}</Typography>
                    </Box>
                    <Chip label={animal.status} size="small" color={animal.status === 'Healthy' ? 'success' : 'warning'} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="outlined" component={Link} to={`/farmer/animals/${animal.id}`}>View</Button>
                    <Button size="small" variant="outlined" startIcon={<Edit />} component={Link} to={`/farmer/animals/${animal.id}/edit`}>Edit</Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default FarmerDashboard;