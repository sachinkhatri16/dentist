import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Chip,
  useMediaQuery,
  useTheme,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  CalendarMonth,
  MedicalServices,
  Receipt,
  BarChart,
  Person,
  Logout,
  Security,
  Schedule,
  ManageAccounts,
  LocalHospital,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 260;

const getNavItems = (role) => {
  const items = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard', roles: ['admin', 'receptionist', 'dentist', 'patient'] },
    { text: 'Patients', icon: <People />, path: '/patients', roles: ['admin', 'receptionist', 'dentist'] },
    { text: 'Appointments', icon: <CalendarMonth />, path: '/appointments', roles: ['admin', 'receptionist', 'dentist'] },
    { text: 'Dentist Schedule', icon: <Schedule />, path: '/dentist-schedule', roles: ['admin', 'receptionist', 'dentist'] },
    { text: 'Medical Records', icon: <MedicalServices />, path: '/medical-records', roles: ['admin', 'receptionist', 'dentist'] },
    { text: 'Billing', icon: <Receipt />, path: '/billing', roles: ['admin', 'receptionist'] },
    { text: 'Reports', icon: <BarChart />, path: '/reports', roles: ['admin', 'receptionist'] },
    { text: 'User Management', icon: <ManageAccounts />, path: '/users', roles: ['admin'] },
    { text: 'Audit Logs', icon: <Security />, path: '/audit-logs', roles: ['admin'] },
  ];
  return items.filter((item) => item.roles.includes(role));
};

const roleColors = {
  admin: 'error',
  receptionist: 'warning',
  dentist: 'primary',
  patient: 'success',
};

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const navItems = getNavItems(user?.role || 'patient');

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 2.5,
          background: 'linear-gradient(135deg, #1976d2 0%, #0d47a1 100%)',
          color: 'white',
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <LocalHospital sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              DentiCare
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Clinic Management
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        <Box display="flex" alignItems="center" gap={1.5} p={1.5} bgcolor="grey.50" borderRadius={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.name}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              color={roleColors[user?.role] || 'default'}
              sx={{ height: 18, fontSize: '0.65rem' }}
            />
          </Box>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  '& .MuiListItemIcon-root': { color: 'white' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />
      <List sx={{ px: 1, py: 1 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => navigate('/profile')}
            sx={{ borderRadius: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Person />
            </ListItemIcon>
            <ListItemText primary="Profile" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            onClick={logout}
            sx={{ borderRadius: 2, color: 'error.main', '& .MuiListItemIcon-root': { color: 'error.main' } }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14 }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {navItems.find((n) => n.path === location.pathname)?.text || 'DentiCare'}
          </Typography>
          <Tooltip title={user?.name}>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { navigate('/profile'); setAnchorEl(null); }}>
              <Person sx={{ mr: 1 }} fontSize="small" /> Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { logout(); setAnchorEl(null); }} sx={{ color: 'error.main' }}>
              <Logout sx={{ mr: 1 }} fontSize="small" /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: '1px solid #e8ecf0' },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default Layout;
