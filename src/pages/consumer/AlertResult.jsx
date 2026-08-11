import React, { useEffect } from 'react';
import { Box, Card, CardContent, Typography, Button, Grid, Chip, Alert, Divider } from '@mui/material';
import { CheckCircle, Error, Info, Warning, QrCode, LocalShipping, Farm, CalendarToday, VerifiedUser } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const AlertResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  useEffect(() => {
    if (!result) {
      navigate('/consumer/scan');
    }
  }, [result, navigate]);

  if (!result) return null;

  const isSafe = result.alert === 'green' || result.safe === true;
  const alertColor = isSafe ? 'success' : 'error';
  const alertIcon = isSafe ? <CheckCircle fontSize="large" /> : <Error fontSize="large" />;
  const alertTitle = isSafe ? 'Safe to Consume' : 'Do Not Consume';
  const alertMessage = isSafe 
    ? 'This milk batch has passed all quality checks and is safe for consumption.'
    : 'This milk batch has quality issues or has expired. Please do not consume and report the issue.';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 2, py: 4, bgcolor: isSafe ? 'success.light' : 'error.light' }}>
      <Card sx={{ maxWidth: 500, width: '100%', mt: 2, mb: 2 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ 
            width: 120, height: 120, borderRadius: '50%', 
            bgcolor: `${alertColor}.main`, color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 3, boxShadow: 3
          }}>
            {alertIcon}
          </Box>
          
          <Typography variant="h3" color={alertColor.main} gutterBottom fontWeight={700}>
            {alertTitle}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" gutterBottom paragraph>
            {alertMessage}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {result.batchInfo && (
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="h6" gutterBottom>Batch Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <LocalShipping fontSize="small" color="text.secondary" />
                    <Typography variant="body2" color="text.secondary">Batch Code</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>{result.batchInfo.batch_code}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Farm fontSize="small" color="text.secondary" />
                    <Typography variant="body2" color="text.secondary">Farm</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>{result.batchInfo.farm_name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday fontSize="small" color="text.secondary" />
                    <Typography variant="body2" color="text.secondary">Collection Date</Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={500}>{result.batchInfo.collection_date ? new Date(result.batchInfo.collection_date).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <VerifiedUser fontSize="small" color="text.secondary" />
                    <Typography variant="body2" color="text.secondary">Quality Status</Typography>
                  </Box>
                  <Chip label={result.batchInfo.quality_status || 'Unknown'} size="small" color={result.batchInfo.quality_status === 'pass' ? 'success' : result.batchInfo.quality_status === 'fail' ? 'error' : 'warning'} />
                </Grid>
              </Grid>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" size="large" startIcon={<QrCode />} onClick={() => navigate('/consumer/scan')}>
              Scan Another
            </Button>
            <Button variant="outlined" size="large" onClick={() => navigate('/consumer/scan')}>
              Back to Scanner
            </Button>
          </Box>

          <Alert severity="info" sx={{ mt: 3 }}>
            <Info sx={{ mr: 1, verticalAlign: 'middle' }} />
            This result is based on the latest quality check data. For concerns, contact the farm or authority.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlertResult;