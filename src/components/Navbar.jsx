import React from 'react';
import { Box, Typography, IconButton, Menu, MenuItem, Avatar, Divider, ListItemIcon, useTheme } from '@mui/material';
import { Notifications, Person, Settings, Logout, Help } from '@mui/icons-material';

const Navbar = ({ user, onProfileClick, anchorEl, handleMenuClose, handleLogout }) => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
      <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mr: 2, display: { sm: 'block', xs: 'none' } }}>
        Agri Farm
      </Typography>
      
      <IconButton color="inherit" onClick={handleMenuClose}><Notifications /></IconButton>
      
      <IconButton color="inherit" onClick={onProfileClick}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
          {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" fontWeight={600}>{user?.full_name}</Typography>
          <Typography variant="caption" color="text.secondary" textTransform="capitalize">{user?.role}</Typography>
        </Box>
        <MenuItem onClick={handleMenuClose}><ListItemIcon><Person fontSize="small" /></ListItemIcon>Profile</MenuItem>
        <MenuItem onClick={handleMenuClose}><ListItemIcon><Settings fontSize="small" /></ListItemIcon>Settings</MenuItem>
        <MenuItem onClick={handleMenuClose}><ListItemIcon><Help fontSize="small" /></ListItemIcon>Help</MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}><ListItemIcon><Logout fontSize="small" color="error" /></ListItemIcon><Typography color="error">Logout</Typography></MenuItem>
      </Menu>
    </Box>
  );
};

export default Navbar;