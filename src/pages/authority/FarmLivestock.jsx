import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Chip, Snackbar, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Search, Agriculture, Pets, LocalShipping, Visibility } from '@mui/icons-material';
import { authorityApi } from '../../api/authorityApi';
import { Link } from 'react-router-dom';

const FarmLivestock = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [livestock, setLivestock] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchFarms(); }, []);

  const fetchFarms = async () => {
    try { const res = await authorityApi.getFarms?.() || Promise.resolve({ data: [] }); setFarms(res.data || []); }
    catch { console.error('Failed to load farms'); }
  };

  const fetchLivestock = async (farmId) => {
    setLoading(true);
    try { const res = await authorityApi.getFarmLivestock(farmId); setLivestock(res.data || []); }
    catch { setSnackbar({ open: true, message: 'Failed to load livestock', severity: 'error' }); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (selectedFarm) fetchLivestock(selectedFarm);
  }, [selectedFarm]);

  const filtered = livestock.filter(a =>
    a.breed?.toLowerCase().includes(search.toLowerCase()) ||
    a.unique_animal_id?.toLowerCase().includes(search.toLowerCase()) ||
    a.health_status?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>Farm & Livestock</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Select Farm</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <FormControl fullWidth sx={{ minWidth: 300 }}>
              <InputLabel>Farm</InputLabel>
              <Select value={selectedFarm} label="Farm" onChange={e => setSelectedFarm(e.target.value)}>
                {farms.map(farm => <MenuItem key={farm.id} value={farm.id}>{farm.farm_name} - {farm.address}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField placeholder="Search animals..." size="small" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <Search /> }} sx={{ width: 250 }} />
          </Box>
        </CardContent>
      </Card>

      {!selectedFarm ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Agriculture sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Select a farm to view livestock</Typography>
        </CardContent></Card>
      ) : loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Pets sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No animals found</Typography>
        </CardContent></Card>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Animal ID</TableCell>
                <TableCell>Breed</TableCell>
                <TableCell>DOB</TableCell>
                <TableCell>Health Status</TableCell>
                <TableCell>Milk Info</TableCell>
                <TableCell>Batches</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(animal => (
                <TableRow key={animal.id} hover>
                  <TableCell><strong>{animal.unique_animal_id}</strong></TableCell>
                  <TableCell>{animal.breed}</TableCell>
                  <TableCell>{animal.dob ? new Date(animal.dob).toLocaleDateString() : '-'}</TableCell>
                  <TableCell><Chip label={animal.health_status || 'Unknown'} size="small" /></TableCell>
                  <TableCell>{animal.milk_yield ? `${animal.milk_yield} L/day` : '-'}</TableCell>
                  <TableCell>{animal.batches_count || 0}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="outlined" startIcon={<Visibility />} component={Link} to={`/authority/scan-qr?animalId=${animal.id}`}>Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default FarmLivestock;