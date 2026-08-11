import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, CardActions, Typography, Button, TextField, Chip, CircularProgress, Snackbar, Slider, FormControlLabel } from '@mui/material';
import { LocationOn, DirectionsCar, MedicalServices, Star } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { farmerApi } from '../../api/farmerApi';
import { useAuth } from '../../context/AuthContext';

const VetList = () => {
  const { user } = useAuth();
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(20);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (user?.latitude && user?.longitude) {
      fetchVets();
    } else {
      setLoading(false);
      setSnackbar({ open: true, message: 'Please update your farm location in profile', severity: 'warning' });
    }
  }, [user]);

  const fetchVets = async () => {
    try {
      const res = await farmerApi.getNearbyVets(user.latitude, user.longitude, radius);
      setVets(res.data || []);
    } catch {
      setSnackbar({ open: true, message: 'Failed to load vets', severity: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>Find Veterinarians</Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>Showing vets within {radius} km of your farm</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>Search Radius: {radius} km</Typography>
          <Slider value={radius} onChange={(e, v) => setRadius(v)} min={5} max={50} step={5} marks={false} />
        </CardContent>
      </Card>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : vets.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
          <MedicalServices sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No veterinarians found nearby</Typography>
          <Typography variant="body2" color="text.secondary">Try increasing the search radius</Typography>
        </CardContent></Card>
      ) : (
        <Grid container spacing={3}>
          {vets.map(vet => (
            <Grid item xs={12} sm={6} md={4} key={vet.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight={600}>{vet.full_name}</Typography>
                    <Chip label={vet.specialization || 'General'} size="small" sx={{ ml: 1 }} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">{vet.clinic_name}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, mb: 1 }}>
                    <LocationOn fontSize="small" color="text.secondary" />
                    <Typography variant="caption">{vet.address}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <DirectionsCar fontSize="small" color="text.secondary" />
                    <Typography variant="caption">{vet.distance?.toFixed(1)} km away</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Star fontSize="small" color="warning" /> {vet.rating || '4.5'}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" variant="contained" component={Link} to={`/farmer/book-appointment?vetId=${vet.id}`}>Book Appointment</Button>
                </CardActions>
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

export default VetList;