import React from 'react';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useLocation, NavLink } from 'react-router-dom';
import {
  Dashboard, Pets, MedicalServices, CalendarToday, Person, QrCode,
  Inventory, LocalShipping, VerifiedUser, Agriculture, DirectionsCar, Assignment, Search, ExpandMore
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const menuItems = {
  farmer: [
    { path: '/farmer/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    {
      label: 'Animals', icon: <Pets />, children: [
        { path: '/farmer/animals', label: 'My Animals', icon: <Pets /> },
        { path: '/farmer/add-animal', label: 'Add Animal', icon: <Person /> },
      ]
    },
    {
      label: 'Vet Appointments', icon: <MedicalServices />, children: [
        { path: '/farmer/vet-list', label: 'Find Vets', icon: <DirectionsCar /> },
        { path: '/farmer/book-appointment', label: 'Book Appointment', icon: <CalendarToday /> },
        { path: '/farmer/appointments', label: 'My Appointments', icon: <Assignment /> },
      ]
    },
  ],
  vet: [
    { path: '/vet/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/vet/appointments', label: 'Appointments', icon: <Assignment /> },
    { path: '/vet/animal-details', label: 'Scan Animal QR', icon: <QrCode /> },
    { path: '/vet/qr-regenerate', label: 'Regenerate QR', icon: <VerifiedUser /> },
  ],
  authority: [
    { path: '/authority/dashboard', label: 'Dashboard', icon: <Dashboard /> },
    { path: '/authority/create-batch', label: 'Create Batch', icon: <LocalShipping /> },
    { path: '/authority/batches', label: 'View Batches', icon: <Inventory /> },
    { path: '/authority/scan-qr', label: 'Scan QR/Barcode', icon: <Search /> },
    { path: '/authority/farm-livestock', label: 'Farm & Livestock', icon: <Agriculture /> },
  ],
  consumer: [
    { path: '/consumer/scan', label: 'Scan Milk QR', icon: <QrCode /> },
  ],
};

const SidebarItem = ({ item, isOpen, onClick }) => {
  const location = useLocation();
  const active = location.pathname === item.path;
  
  return (
    <ListItem disablePadding sx={{ px: 1 }}>
      <ListItemButton
        component={NavLink}
        to={item.path}
        onClick={onClick}
        sx={{
          borderRadius: 2,
          bgcolor: active ? 'primary.light' : 'transparent',
          color: active ? 'primary.contrastText' : 'text.primary',
          '& .MuiListItemIcon-root': { color: active ? 'inherit' : 'text.secondary', minWidth: 40 },
          '&:hover': { bgcolor: active ? 'primary.main' : 'action.hover' },
        }}
      >
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    </ListItem>
  );
};

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'farmer';
  const items = menuItems[role] || menuItems.farmer;
  const [expanded, setExpanded] = React.useState({});

  const handleExpand = (label) => {
    setExpanded(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <List sx={{ py: 1 }} component="nav" aria-label="main navigation">
      {items.map((item) => {
        if (item.children) {
          const isExpanded = expanded[item.label];
          return (
            <React.Fragment key={item.label}>
              <Accordion
                expanded={isExpanded}
                onChange={() => handleExpand(item.label)}
                sx={{ mb: 0.5, borderRadius: 2, '&:before': { display: 'none' }, boxShadow: 'none' }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{ borderRadius: 2, bgcolor: isExpanded ? 'primary.light' : 'transparent', color: isExpanded ? 'primary.contrastText' : 'text.primary' }}
                >
                  <ListItemIcon sx={{ color: isExpanded ? 'inherit' : 'text.secondary', minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </AccordionSummary>
                <AccordionDetails>
                  <List component="nav" sx={{ px: 2, pb: 1 }}>
                    {item.children.map((child) => (
                      <SidebarItem key={child.path} item={child} />
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </React.Fragment>
          );
        }
        return <SidebarItem key={item.path} item={item} />;
      })}
    </List>
  );
};

export default Sidebar;