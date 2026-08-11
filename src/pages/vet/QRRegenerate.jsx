import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Grid, CircularProgress, Snackbar, Alert, Chip, Divider } from '@mui/material';
import { QrCode, Search, Refresh, Download } from '@mui/icons-material';
import { vetApi } from '../../api/vetApi';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const QRRegenerate = () => {
  const [animalId, setAnimalId] = useState('');
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleFetch = async () => {
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
    setRegenerating(true);
    try {
      const res = await vetApi.regenerateQR(animal.id);
      setAnimal(prev => ({ ...prev, qr_code_data: res.data.qr_code_data }));
      setSnackbar({ open: true, message: 'QR code regenerated successfully', severity: 'success' });
    } catch { setSnackbar({ open: true, message: 'Failed to regenerate QR', severity: 'error' }); }
    finally { setRegenerating(false); }
  };

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>Regenerate Animal QR</Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>Use this if an animal's QR tag is lost or damaged</Typography>

      <Card sx={{ mb: 3, maxWidth: 600 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Find Animal</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <TextField
                fullWidth
                label="Animal Unique ID"
                value={animalId}
                onChange={e => setAnimalId(e.target.value)}
                placeholder="ANM-XXXX"
              />
            </Box>
            <Button variant="contained" startIcon={<Search />} onClick={handleFetch} disabled={loading || !animalId}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Find Animal'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {animal && (
        <Card sx={{ mb: 3, maxWidth: 600 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>{animal.breed}</Typography>
                <Typography variant="body2" color="text.secondary">{animal.unique_animal_id || animal.uniqueId}</Typography>
              </Box>
              <Chip label={animal.health_status || 'Unknown'} size="small" />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" gutterBottom>Current QR Code</Typography>
            {animal.qr_code_data && (
              <QRCodeDisplay data={animal.qr_code_data} title={`${animal.breed} - ${animal.unique_animal_id}`} size={180} />
            )}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<Refresh />} onClick={handleRegenerate} disabled={regenerating}>
                {regenerating ? <CircularProgress size={20} color="inherit" /> : 'Regenerate QR'}
              </Button>
              <Alert severity="warning">
                This will invalidate the old QR code. The animal's tag will need to be replaced.
              </Alert>
            </Box>
          </CardContent>
        </Card>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default QRRegenerate;