import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, TextField, FormControl, InputLabel, Select, MenuItem, Chip, CircularProgress, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, QrCode, Search, ContentCopy, Print, Download } from '@mui/icons-material';
import { authorityApi } from '../../api/authorityApi';
import { farmerApi } from '../../api/farmerApi';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const CreateBatch = () => {
  const [step, setStep] = useState(0);
  const [farms, setFarms] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [formData, setFormData] = useState({ farmId: '', quantity: '', collection_date: '', collection_time: '' });
  const [batchResult, setBatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchFarms(); }, []);

  const fetchFarms = async () => {
    try { const res = await farmerApi.getAnimals(); /* mock farms */ setFarms([{ id: 1, farm_name: 'Demo Farm', address: '123 Farm Rd' }]); }
    catch { console.error('Failed to load farms'); }
  };

  const fetchFarmAnimals = async (farmId) => {
    try { const res = await authorityApi.getFarmLivestock(farmId); setAnimals(res.data || []); }
    catch { console.error('Failed to load animals'); }
  };

  const handleFarmChange = (e) => {
    const farmId = e.target.value;
    setFormData(prev => ({ ...prev, farmId }));
    setSelectedAnimals([]);
    fetchFarmAnimals(farmId);
  };

  const toggleAnimal = (animal) => {
    setSelectedAnimals(prev => prev.some(a => a.id === animal.id) 
      ? prev.filter(a => a.id !== animal.id)
      : [...prev, animal]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAnimals.length === 0) { setSnackbar({ open: true, message: 'Select at least one animal', severity: 'error' }); return; }
    setLoading(true);
    try {
      const res = await authorityApi.createBatch({
        farm_id: formData.farmId,
        animal_ids: selectedAnimals.map(a => a.id),
        quantity: Number(formData.quantity),
        collection_date: `${formData.collection_date}T${formData.collection_time}`,
      });
      setBatchResult(res.data);
      setSnackbar({ open: true, message: 'Batch created successfully!', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to create batch', severity: 'error' });
    } finally { setLoading(false); }
  };

  const handleBarcode = async () => {
    if (!batchResult?.batch_code) return;
    try {
      const res = await authorityApi.generateBarcode(batchResult.batch_code);
      setBatchResult(prev => ({ ...prev, barcode_data: res.data.barcode_data }));
    } catch { setSnackbar({ open: true, message: 'Failed to generate barcode', severity: 'error' }); }
  };

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>Create Milk Batch</Typography>

      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {['Farm', 'Animals', 'Details', 'Confirm'].map((label, index) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, 
              bgcolor: index <= step ? 'primary.main' : 'grey.200', color: index <= step ? 'primary.contrastText' : 'text.secondary',
              borderRadius: index === 0 ? '8px 0 0 8px' : index === 3 ? '0 8px 8px 0' : 0 }}>
              {label}
            </Box>
          ))}
        </Box>
      </Box>

      {batchResult ? (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Batch Created Successfully!</Typography>
            <QRCodeDisplay 
              data={{ type: 'batch', batchCode: batchResult.batch_code }} 
              title={`Batch: ${batchResult.batch_code}`}
              subtitle={`Farm: ${farms.find(f => f.id === formData.farmId)?.farm_name}`}
            />
            {batchResult.barcode_data && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom>Barcode</Typography>
                <QRCodeDisplay data={batchResult.barcode_data} title="Barcode" size={300} />
                <Button variant="contained" startIcon={<Print />} onClick={() => window.print()} sx={{ mt: 2 }}>Print Barcode</Button>
              </Box>
            )}
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => { setBatchResult(null); setStep(0); setSelectedAnimals([]); setFormData({ farmId: '', quantity: '', collection_date: '', collection_time: '' }); }}>Create Another</Button>
              <Button variant="outlined" startIcon={<ContentCopy />} onClick={() => navigator.clipboard.writeText(batchResult.batch_code)}>Copy Batch Code</Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            {step === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>Select Farm</Typography>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Farm</InputLabel>
                  <Select value={formData.farmId} label="Farm" onChange={handleFarmChange} required>
                    {farms.map(farm => <MenuItem key={farm.id} value={farm.id}>{farm.farm_name} - {farm.address}</MenuItem>)}
                  </Select>
                </FormControl>
              </Box>
            )}
            {step === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>Select Animals</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>Selected: {selectedAnimals.length} animals</Typography>
                {animals.length === 0 ? (
                  <Alert severity="info">No animals found for this farm</Alert>
                ) : (
                  <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                    {animals.map(animal => (
                      <Card key={animal.id} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box>
                              <Typography variant="subtitle2">{animal.breed}</Typography>
                              <Typography variant="body2" color="text.secondary">{animal.unique_animal_id}</Typography>
                            </Box>
                            <Button size="small" variant={selectedAnimals.some(a => a.id === animal.id) ? 'contained' : 'outlined'} onClick={() => toggleAnimal(animal)}>
                              {selectedAnimals.some(a => a.id === animal.id) ? 'Selected' : 'Add'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </Box>
            )}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="number" name="quantity" label="Milk Quantity (Liters)" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="date" name="collection_date" label="Collection Date" value={formData.collection_date} onChange={e => setFormData({...formData, collection_date: e.target.value})} required InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth type="time" name="collection_time" label="Collection Time" value={formData.collection_time} onChange={e => setFormData({...formData, collection_time: e.target.value})} required InputLabelProps={{ shrink: true }} />
                  </Grid>
                </Grid>
              </form>
            )}
            {step === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>Confirm Batch Details</Typography>
                <Typography variant="body1">Farm: {farms.find(f => f.id === formData.farmId)?.farm_name}</Typography>
                <Typography variant="body1">Animals: {selectedAnimals.length} selected</Typography>
                <Typography variant="body1">Quantity: {formData.quantity} L</Typography>
                <Typography variant="body1">Date: {formData.collection_date} at {formData.collection_time}</Typography>
              </Box>
            )}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button variant="outlined" startIcon={<QrCode />} onClick={() => setStep(prev => Math.max(prev - 1, 0))} disabled={step === 0}>Back</Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {step < 3 ? (
                  <Button variant="contained" onClick={() => setStep(prev => Math.min(prev + 1, 3))} disabled={ (step === 0 && !formData.farmId) || (step === 1 && selectedAnimals.length === 0) || (step === 2 && (!formData.quantity || !formData.collection_date)) }>
                    Next
                  </Button>
                ) : (
                  <Button type="submit" variant="contained" size="large" onClick={handleSubmit} disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}>
                    {loading ? 'Creating...' : 'Create Batch'}
                  </Button>
                )}
              </Box>
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

export default CreateBatch;