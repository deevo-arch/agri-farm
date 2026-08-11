import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Grid, CircularProgress, Snackbar, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { farmerApi } from '../../api/farmerApi';

const breeds = ['Holstein', 'Jersey', 'Gir', 'Sahiwal', 'Red Sindhi', 'Tharparkar', 'Kankrej', 'Ongole', 'Crossbreed', 'Other'];

const AddAnimal = () => {
  const [formData, setFormData] = useState({ breed: '', dob: '', health_status: 'Healthy' });
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await farmerApi.createAnimal(formData);
      setQrData({ type: 'animal', uniqueId: res.data.unique_animal_id, farmId: res.data.farm_id });
      setSnackbar({ open: true, message: 'Animal added successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to add animal', severity: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button variant="text" startIcon={<ArrowBack />} component={Link} to="/farmer/animals">Back to Animals</Button>
        <Typography variant="h4" color="primary.main" sx={{ ml: 2 }}>Add New Animal</Typography>
      </Box>

      {qrData && (
        <Box sx={{ mb: 4 }}>
          <Card><CardContent>
            <Typography variant="h6" gutterBottom>Animal Registered Successfully!</Typography>
            <QRCodeDisplay data={qrData} title={`Animal: ${qrData.uniqueId}`} onClose={() => { setQrData(null); navigate('/farmer/animals'); }} />
          </CardContent></Card>
        </Box>
      )}

      <Card sx={{ maxWidth: 600 }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Breed</InputLabel>
                  <Select name="breed" value={formData.breed} label="Breed" onChange={handleChange} required>
                    {breeds.map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth type="date" name="dob" label="Date of Birth" value={formData.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Health Status</InputLabel>
                  <Select name="health_status" value={formData.health_status} label="Health Status" onChange={handleChange}>
                    <MenuItem value="Healthy">Healthy</MenuItem>
                    <MenuItem value="Check-up Due">Check-up Due</MenuItem>
                    <MenuItem value="Under Treatment">Under Treatment</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button type="submit" variant="contained" size="large" disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}>
                {loading ? 'Adding...' : 'Add Animal'}
              </Button>
              <Button variant="outlined" component={Link} to="/farmer/animals">Cancel</Button>
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

export default AddAnimal;