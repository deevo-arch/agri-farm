import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, CssBaseline, Typography } from '@mui/material';

const MainLayout = () => {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CssBaseline />
      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <Outlet />
      </Box>
      <Box
        component="footer"
        sx={{ py: 2, px: 3, textAlign: 'center', backgroundColor: 'grey.100', borderTop: '1px solid', borderColor: 'divider' }}
      >
        <Typography variant="caption" color="text.secondary">
          Agri Farm - Farm to Consumer Traceability
        </Typography>
      </Box>
    </Box>
  );
};

export default MainLayout;