import React, { useState, useEffect } from 'react';
import { Box, Grid, Card, CardContent, Typography, Button, Chip, CircularProgress } from '@mui/material';
import { LocalShipping, Inventory, QrCode, Farm, Assignment, Add } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { authorityApi } from '../../api/authorityApi';
import { useAuth } from '../../context/AuthContext';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    recentBatches: 0,
    farmsVisited: 0,
    totalAnimals: 0,
    pendingQuality: 0,
  });
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [batchesRes] = await Promise.all([
        authorityApi.getBatches?.() || Promise.resolve({ data: [] }),
      ]);
      const batches = batchesRes.data || [];
      setRecentBatches(batches.slice(0, 5));
      setStats({
        recentBatches: batches.length,
        farmsVisited: new Set(batches.map(b => b.farm_id)).size,
        totalAnimals: batches.reduce((sum, b) => sum + (b.animals?.length || 0), 0),
        pendingQuality: batches.filter(b => b.quality_status === 'pending').length,
      });
    } catch { console.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  const statCards = [
    { label: 'Total Batches', value: stats.recentBatches, icon: <LocalShipping />, color: 'primary' },
    { label: 'Farms Visited', value: stats.farmsVisited, icon: <Farm />, color: 'secondary' },
    { label: 'Animals Tracked', value: stats.totalAnimals, icon: <Inventory />, color: 'success' },
    { label: 'Pending Quality', value: stats.pendingQuality, icon: <Assignment />, color: 'warning' },
  ];

  return (
    <Box>
      <Typography variant="h4" color="primary.main" gutterBottom>Authority Dashboard</Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>Welcome, {user?.full_name} ({user?.department})</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                    <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                  </Box>
                  <Box sx={{ p: 1, bgcolor: `${stat.color}.light`, borderRadius: 2, color: `${stat.color}.main` }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<Add />} component={Link} to="/authority/create-batch">Create Batch</Button>
        <Button variant="outlined" startIcon={<QrCode />} component={Link} to="/authority/scan-qr">Scan QR/Barcode</Button>
        <Button variant="outlined" component={Link} to="/authority/farm-livestock">Farm & Livestock</Button>
      </Box>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Recent Batches</Typography>
            <Button size="small" component={Link} to="/authority/batches">View All</Button>
          </Box>
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : recentBatches.length === 0 ? (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>No batches created yet</Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Batch Code</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Farm</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Animals</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Quantity</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBatches.map(batch => (
                    <tr key={batch.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}><strong>{batch.batch_code}</strong></td>
                      <td style={{ padding: '12px' }}>{batch.farm_name}</td>
                      <td style={{ padding: '12px' }}>{new Date(batch.collection_date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px' }}>{batch.animals_count || 0}</td>
                      <td style={{ padding: '12px' }}>{batch.quantity} L</td>
                      <td style={{ padding: '12px' }}>
                        <Chip label={batch.quality_status || 'pending'} size="small" color={batch.quality_status === 'pass' ? 'success' : batch.quality_status === 'fail' ? 'error' : 'warning'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuthorityDashboard;