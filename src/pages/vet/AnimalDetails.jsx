import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, TextField, Alert, Divider, CircularProgress, Snackbar, Chip } from '@mui/material';
import { QrCode, Search, MedicalServices, LocalHospital, History } from '@mui/icons-material';
import { vetApi } from '../../api/vetApi';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const AnimalDetails = () => {
  const [scannedData, setScannedData] = useState('');
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [manualId, setManualId] = useState('');

  const handleScanSuccess = (result) => {
    if (result) {
      try {
        const data = JSON.parse(result);
        if (data.uniqueId) setScannedData(data.uniqueId);
        else setScannedData(result);
      } catch {
        setScannedData(result);
      }
    }
  };

  const handleFetch = async (id) => {
    const animalId = id || scannedData || manualId;
    if (!animalId) return;
    setLoading(true);
    try {
      const res = await vetApi.getAnimalByQR(animalId);
      setAnimal(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Animal not found', severity: 'error' });
    } finally { setLoading(false); }
  };

  const handleRegenerate = async () => {
    if (!animal?.id) return;
    try {
      const res = await vetApi.regenerateQR(animal.id);
      setAnimal(prev => ({ ...prev, qr_code_data: res.data.qr_code_data }));
      setSnackbar({ open: true, message: 'QR code regenerated', severity: 'success' });
    } catch { setSnackbar({ open: true, message: 'Failed to regenerate', severity: 'error' }); }
  };

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>Scan Animal QR</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Scan QR Code</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Or Enter Animal ID"
                value={manualId}
                onChange={e => setManualId(e.target.value)}
                placeholder="ANM-XXXX"
              />
            </Box>
            <Button variant="contained" startIcon={<Search />} onClick={() => handleFetch(manualId)} disabled={loading || !manualId}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Fetch Details'}
            </Button>
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <QrCode sx={{ mr: 1, verticalAlign: 'middle' }} /> Point camera at animal's QR tag, or enter the unique ID manually above.
          </Alert>
        </CardContent>
      </Card>

      {animal && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight={600}>{animal.breed}</Typography>
                  <Typography variant="body1" color="text.secondary">{animal.unique_animal_id || animal.uniqueId}</Typography>
                </Box>
                <Chip label={animal.health_status || 'Unknown'} size="small" />
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                  <Typography>{animal.dob ? new Date(animal.dob).toLocaleDateString() : 'Not specified'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Farm</Typography>
                  <Typography>{animal.farm_name || animal.farm?.farm_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Farmer</Typography>
                  <Typography>{animal.farmer_name || animal.farmer?.full_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Farm Address</Typography>
                  <Typography>{animal.farm_address || animal.farm?.address}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {animal.qr_code_data && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Animal QR Code</Typography>
                <QRCodeDisplay data={animal.qr_code_data} title={`${animal.breed} - ${animal.unique_animal_id}`} size={180} />
                <Button variant="outlined" startIcon={<MedicalServices />} onClick={handleRegenerate} sx={{ mt: 2 }}>Regenerate QR</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Medical History</Typography>
              <Alert severity="info">Medical history feature coming soon. Will show past treatments, vaccinations, and vet notes.</Alert>
            </CardContent>
          </Card>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default AnimalDetails;