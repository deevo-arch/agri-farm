import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Alert, TextField, CircularProgress, Snackbar, Tabs, Tab, Chip, Divider } from '@mui/material';
import { QrCode, Search, Pets, LocalShipping, Visibility } from '@mui/icons-material';
import { authorityApi } from '../../api/authorityApi';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const ScanQR = () => {
  const [tab, setTab] = useState(0);
  const [scannedData, setScannedData] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleScanSuccess = (resultStr) => {
    if (resultStr) {
      try {
        const data = JSON.parse(resultStr);
        setScannedData(data.uniqueId || data.batchCode || resultStr);
      } catch {
        setScannedData(resultStr);
      }
    }
  };

  const handleFetch = async () => {
    const id = manualInput || scannedData;
    if (!id) return;
    setLoading(true);
    try {
      if (tab === 0) {
        const res = await authorityApi.getAnimalBatches(id);
        setResult({ type: 'animal', data: res.data });
      } else {
        const res = await authorityApi.getBatch(id);
        setResult({ type: 'batch', data: res.data });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Not found', severity: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>Scan QR / Barcode</Typography>

      <Tabs value={tab} onChange={(e, v) => { setTab(v); setResult(null); setScannedData(''); setManualInput(''); }} sx={{ mb: 3 }}>
        <Tab label="Animal QR" icon={<Pets />} />
        <Tab label="Batch Barcode" icon={<LocalShipping />} />
      </Tabs>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>{tab === 0 ? 'Scan Animal QR' : 'Scan Batch Barcode'}</Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <QrCode sx={{ mr: 1 }} /> Point camera at the {tab === 0 ? "animal's QR tag" : "batch barcode"} or enter the ID manually.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <Box sx={{ flex: 1, minWidth: 250 }}>
              <TextField
                fullWidth
                label={tab === 0 ? 'Animal Unique ID' : 'Batch Code'}
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder={tab === 0 ? 'ANM-XXXX' : 'BATCH-XXXX'}
              />
            </Box>
            <Button variant="contained" startIcon={<Search />} onClick={handleFetch} disabled={loading || !manualInput}>
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Fetch Details'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent>
            {result.type === 'animal' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>{result.data.breed}</Typography>
                    <Typography variant="body1" color="text.secondary">{result.data.unique_animal_id}</Typography>
                  </Box>
                  <Chip label={result.data.health_status || 'Unknown'} size="small" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Farm</Typography>
                    <Typography>{result.data.farm_name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Farmer</Typography>
                    <Typography>{result.data.farmer_name}</Typography>
                  </Grid>
                </Grid>
                {result.data.batches && result.data.batches.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>Associated Batches</Typography>
                    {result.data.batches.map(batch => (
                      <Card key={batch.id} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="subtitle2">{batch.batch_code}</Typography>
                            <Typography variant="body2" color="text.secondary">{new Date(batch.collection_date).toLocaleDateString()}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}

            {result.type === 'batch' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h5" fontWeight={600}>{result.data.batch_code}</Typography>
                    <Typography variant="body1" color="text.secondary">{result.data.farm_name}</Typography>
                  </Box>
                  <Chip label={result.data.quality_status || 'pending'} size="small" color={result.data.quality_status === 'pass' ? 'success' : 'warning'} />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Collection Date</Typography>
                    <Typography>{new Date(result.data.collection_date).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Quantity</Typography>
                    <Typography>{result.data.quantity} L</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Collected By</Typography>
                    <Typography>{result.data.collected_by_name}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Animals</Typography>
                    <Typography>{result.data.animals_count}</Typography>
                  </Grid>
                </Grid>
                {result.data.animals && result.data.animals.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>Contributing Animals</Typography>
                    {result.data.animals.map(animal => (
                      <Card key={animal.id} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent>
                          <Typography variant="subtitle2">{animal.breed} - {animal.unique_animal_id}</Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default ScanQR;