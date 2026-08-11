import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, CardActions, Typography, Button, Chip, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Snackbar } from '@mui/material';
import { Add, Edit, Delete, QrCode, Visibility } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { farmerApi } from '../../api/farmerApi';

const Animals = () => {
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrDialog, setQrDialog] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => { fetchAnimals(); }, []);

  const fetchAnimals = async () => {
    try { const res = await farmerApi.getAnimals(); setAnimals(res.data || []); }
    catch { setSnackbar({ open: true, message: 'Failed to load animals', severity: 'error' }); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this animal?')) return;
    try { await farmerApi.deleteAnimal?.(id); setAnimals(prev => prev.filter(a => a.id !== id)); }
    catch { setSnackbar({ open: true, message: 'Failed to delete', severity: 'error' }); }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary.main">My Animals</Typography>
        <Button variant="contained" startIcon={<Add />} component={Link} to="/farmer/add-animal">Add Animal</Button>
      </Box>

      <TextField
        placeholder="Search animals..."
        size="small"
        sx={{ width: 300, mb: 2 }}
        InputProps={{ startAdornment: <IconButton><Visibility /></IconButton> }}
      />

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : animals.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">No animals yet</Typography>
          <Button variant="contained" startIcon={<Add />} component={Link} to="/farmer/add-animal" sx={{ mt: 2 }}>Add Your First Animal</Button>
        </CardContent></Card>
      ) : (
        <Grid container spacing={3}>
          {animals.map(animal => (
            <Grid item xs={12} sm={6} md={4} key={animal.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>{animal.breed}</Typography>
                      <Typography variant="body2" color="text.secondary">{animal.unique_animal_id || animal.uniqueId}</Typography>
                    </Box>
                    <Chip label={animal.health_status || 'Unknown'} size="small" />
                  </Box>
                  {animal.dob && <Typography variant="body2" color="text.secondary">Born: {new Date(animal.dob).toLocaleDateString()}</Typography>}
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1 }}>
                  <Button size="small" startIcon={<QrCode />} onClick={() => setQrDialog(animal)}>QR Code</Button>
                  <Button size="small" startIcon={<Edit />} component={Link} to={`/farmer/animals/${animal.id}/edit`}>Edit</Button>
                  <IconButton size="small" color="error" onClick={() => handleDelete(animal.id)}><Delete /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <QRCodeDisplay
        data={qrDialog ? { type: 'animal', uniqueId: qrDialog.unique_animal_id || qrDialog.uniqueId, farmId: qrDialog.farm_id } : null}
        title={`${qrDialog?.breed} - ${qrDialog?.unique_animal_id || qrDialog?.uniqueId}`}
        onClose={() => setQrDialog(null)}
      />
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default Animals;