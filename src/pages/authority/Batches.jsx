import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, IconButton, Snackbar, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { QrCode, Search, Visibility, Print, ContentCopy } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { authorityApi } from '../../api/authorityApi';
import QRCodeDisplay from '../../components/QRCodeDisplay';

const Batches = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [barcodeDialog, setBarcodeDialog] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchBatches(); }, []);

  const fetchBatches = async () => {
    try { const res = await authorityApi.getBatches?.() || Promise.resolve({ data: [] }); setBatches(res.data || []); }
    catch { setSnackbar({ open: true, message: 'Failed to load batches', severity: 'error' }); }
    finally { setLoading(false); }
  };

  const handleBarcode = async (batchCode) => {
    try { const res = await authorityApi.generateBarcode(batchCode); setBarcodeDialog(res.data); }
    catch { setSnackbar({ open: true, message: 'Failed to generate barcode', severity: 'error' }); }
  };

  const filtered = batches.filter(b => 
    b.batch_code.toLowerCase().includes(search.toLowerCase()) ||
    b.farm_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" color="primary.main">View Batches</Typography>
        <TextField placeholder="Search batches..." size="small" value={search} onChange={e => setSearch(e.target.value)} InputProps={{ startAdornment: <Search /> }} sx={{ width: 300 }} />
      </Box>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Card><CardContent sx={{ textAlign: 'center', py: 4 }}>
          <QrCode sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">No batches found</Typography>
        </CardContent></Card>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Batch Code</TableCell>
                <TableCell>Farm</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Animals</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Quality</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(batch => (
                <TableRow key={batch.id} hover>
                  <TableCell><strong>{batch.batch_code}</strong></TableCell>
                  <TableCell>{batch.farm_name}</TableCell>
                  <TableCell>{new Date(batch.collection_date).toLocaleDateString()}</TableCell>
                  <TableCell>{batch.animals_count || 0}</TableCell>
                  <TableCell>{batch.quantity} L</TableCell>
                  <TableCell>
                    <Chip label={batch.quality_status || 'pending'} size="small" color={batch.quality_status === 'pass' ? 'success' : batch.quality_status === 'fail' ? 'error' : 'warning'} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleBarcode(batch.batch_code)}><QrCode /></IconButton>
                    <IconButton size="small" component={Link} to={`/authority/batches/${batch.id}`}><Visibility /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {barcodeDialog && (
        <Dialog open={!!barcodeDialog} onClose={() => setBarcodeDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Barcode for {barcodeDialog.batch_code}</DialogTitle>
          <DialogContent>
            <QRCodeDisplay data={barcodeDialog.barcode_data} title={`Batch: ${barcodeDialog.batch_code}`} size={300} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBarcodeDialog(null)}>Close</Button>
            <Button onClick={() => window.print()}>Print</Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default Batches;