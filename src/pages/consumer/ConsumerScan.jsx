import React, { useState, useEffect, useRef } from 'react';
import { Box, Card, CardContent, Typography, Button, TextField, Alert, CircularProgress, Snackbar, Grid } from '@mui/material';
import { QrCode, Search, CameraAlt, CheckCircle, Error, Info } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { consumerApi } from '../../api/consumerApi';

const ConsumerScan = () => {
  const [scannedData, setScannedData] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scannerActive) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => stopScanner();
  }, [scannerActive]);

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Camera access denied. Please enter code manually.', severity: 'error' });
      setScannerActive(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const handleScan = async () => {
    const data = manualInput || scannedData;
    if (!data) return;
    setLoading(true);
    try {
      const res = await consumerApi.scanBatch(data);
      navigate('/consumer/result', { state: { result: res.data } });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.message || 'Failed to scan', severity: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, py: 4, bgcolor: 'grey.50' }}>
      <Box sx={{ textAlign: 'center', mb: 4, maxWidth: 500 }}>
        <Typography variant="h3" color="primary.main" gutterBottom>Agri Farm</Typography>
        <Typography variant="h5" gutterBottom>Milk Quality Check</Typography>
        <Typography variant="body1" color="text.secondary">Scan the QR code on your milk packet to check quality status</Typography>
      </Box>

      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Scan QR Code</Typography>
            
            {scannerActive && (
              <Box sx={{ mb: 3, position: 'relative', borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.900', maxWidth: '100%' }}>
                <video 
                  ref={videoRef} 
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                  playsInline
                  muted
                />
                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <Box sx={{ width: '80%', height: '80%', border: '3px solid #2E7D32', borderRadius: 8, boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)' }} />
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button 
                variant={scannerActive ? 'outlined' : 'contained'} 
                startIcon={<CameraAlt />} 
                onClick={() => setScannerActive(!scannerActive)}
                fullWidth
                size="large"
              >
                {scannerActive ? 'Stop Camera' : 'Start Camera Scanner'}
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', fontSize: '0.875rem' }}>
                <span>or</span>
              </Box>

              <TextField
                fullWidth
                label="Enter Batch Code Manually"
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
                placeholder="BATCH-XXXX"
                InputProps={{ startAdornment: <QrCode /> }}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            size="large"
            fullWidth
            disabled={loading || (!manualInput && !scannedData)}
            onClick={handleScan}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Search />}
          >
            {loading ? 'Checking...' : 'Check Quality'}
          </Button>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            This will check the milk batch for quality issues, expiry date, and test results.
          </Alert>
        </CardContent>
      </Card>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({...snackbar, open: false})}>
        <div>{snackbar.message}</div>
      </Snackbar>
    </Box>
  );
};

export default ConsumerScan;