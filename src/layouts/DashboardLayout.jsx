import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, AppBar, Toolbar, List, ListItem, ListItemIcon, ListItemText,
  IconButton, Typography, Avatar, Menu, MenuItem, Divider, useMediaQuery, useTheme,
  Collapse, ListItemButton, Accordion, AccordionSummary, AccordionDetails, ExpandMoreIcon
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Person, Pets, MedicalServices, CalendarToday,
  Inventory, QrCode, LocalShipping, Analytics, Settings, Logout, ExpandMore,
  Farm, LocalHospital, DirectionsCar, VerifiedUser
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const DashboardLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { handleMenuClose(); logout(); };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', py: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Avatar sx={{ width: 48, height: 48, bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
        {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
      </Avatar>
      <Typography variant="h6" sx={{ mb: 0.5 }}>{user?.full_name}</Typography>
      <Typography variant="caption" color="text.secondary" textTransform="capitalize">{user?.role}</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - 260px)` },
          ml: { md: '260px' },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Navbar user={user} onProfileClick={handleProfileMenuOpen} anchorEl={anchorEl} handleMenuClose={handleMenuClose} handleLogout={handleLogout} />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: 260 }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260 },
          }}
        >
          {drawer}
          <Divider />
          <Sidebar />
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 260, borderRight: 1, borderColor: 'divider' },
          }}
          open
        >
          {drawer}
          <Divider />
          <Sidebar />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 260px)` },
          mt: '64px',
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;