import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Stepper, Step, StepLabel, CircularProgress, Snackbar, Alert } from '@mui/material';
import { ArrowBack, ArrowForward, CheckCircle } from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { farmerApi } from '../../api/farmerApi';
import { useAuth } from '../../context/AuthContext';

const steps = ['Select Vet', 'Select Animal', 'Date & Time', 'Confirm'];

const BookAppointment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [vets, setVets] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [formData, setFormData] = useState({ vetId: '', animalId: '', date: '', time: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchVets();
    fetchAnimals();
    if (location.search) {
      const params = new URLSearchParams(location.search);
      if (params.get('vetId')) { setFormData(prev => ({ ...prev, vetId: params.get('vetId') })); setActiveStep(1); }
    }
  }, [location.search]);

  const fetchVets = async () => {
    if (!user?.latitude || !user?.longitude) return;
    try { const res = await farmerApi.getNearbyVets(user.latitude, user.longitude, 20); setVets(res.data || []); }
    catch { console.error('Failed to load vets'); }
  };

  const fetchAnimals = async () => {
    try { const res = await farmerApi.getAnimals(); setAnimals(res.data || []); }
    catch { console.error('Failed to load animals'); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleNext = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
  const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await farmerApi.createAppointment({ ...formData, farmer_id: user.id });
      setSnackbar({ open: true, message: 'Appointment booked successfully!', severity: 'success' });
      setTimeout(() => navigate('/farmer/appointments'), 1500);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to book appointment', severity: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button variant="text" startIcon={<ArrowBack />} component={Link} to="/farmer/vet-list">Back to Vets</Button>
        <Typography variant="h4" color="primary.main" sx={{ ml: 2 }}>Book Appointment</Typography>
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Select Veterinarian</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Veterinarian</InputLabel>
                  <Select name="vetId" value={formData.vetId} label="Veterinarian" onChange={handleChange} required>
                    {vets.map(vet => (
                      <MenuItem key={vet.id} value={vet.id}>{vet.full_name} - {vet.clinic_name} ({vet.distance?.toFixed(1)} km)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Select Animal</Typography>
                {animals.length === 0 ? (
                  <Alert severity="info">No animals found. <Link to="/farmer/add-animal">Add an animal first</Link></Alert>
                ) : (
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Animal</InputLabel>
                    <Select name="animalId" value={formData.animalId} label="Animal" onChange={handleChange} required>
                      {animals.map(animal => (
                        <MenuItem key={animal.id} value={animal.id}>{animal.breed} - {animal.unique_animal_id || animal.uniqueId}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </Box>
            )}

            {activeStep === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="date" name="date" label="Appointment Date" value={formData.date} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth type="time" name="time" label="Appointment Time" value={formData.time} onChange={handleChange} required InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={4} name="reason" label="Reason / Symptoms" value={formData.reason} onChange={handleChange} placeholder="Describe the reason for the visit..." />
                </Grid>
              </Grid>
            )}

            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>Confirm Appointment</Typography>
                <Typography variant="body1">Please review your appointment details:</Typography>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Vet</Typography><Typography fontWeight={500}>{vets.find(v => v.id === formData.vetId)?.full_name}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Animal</Typography><Typography fontWeight={500}>{animals.find(a => a.id === formData.animalId)?.breed}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Date</Typography><Typography fontWeight={500}>{formData.date}</Typography></Grid>
                  <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Time</Typography><Typography fontWeight={500}>{formData.time}</Typography></Grid>
                  <Grid item xs={12}><Typography variant="body2" color="text.secondary">Reason</Typography><Typography fontWeight={500}>{formData.reason}</Typography></Grid>
                </Grid>
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" startIcon={<ArrowBack />} onClick={handleBack} disabled={activeStep === 0}>Back</Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep < steps.length - 1 ? (
                  <Button variant="contained" endIcon={<ArrowForward />} onClick={handleNext} disabled={ (activeStep === 0 && !formData.vetId) || (activeStep === 1 && !formData.animalId) }>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}>
                    {loading ? 'Booking...' : 'Confirm Booking'}
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default BookAppointment;