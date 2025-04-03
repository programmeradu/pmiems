import React, { useState, useEffect } from 'react';
import { Route, Routes, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

// Material UI imports
import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Collapse,
  Button,
  useMediaQuery,
  Tooltip,
  Paper
} from '@mui/material';

// Material UI icons
import HomeIcon from '@mui/icons-material/Home';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SettingsIcon from '@mui/icons-material/Settings';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LanguageIcon from '@mui/icons-material/Language';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Import actual components
import { 
  Dashboard, 
  Analysis, 
  DepartmentList, 
  PositionList,
  MembersListPage,
  MemberAddPage,
  MemberEditPage,
  MemberDetailPage
} from '../pages';
import Reports from '../pages/Reports/Reports';
import Settings from '../pages/Settings/Settings';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const DRAWER_WIDTH = 260;

const DashboardLayout: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, isRTL } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState<null | HTMLElement>(null);
  const isMobile = useMediaQuery('(max-width:1024px)');

  // Navigation items
  const navItems: NavItem[] = [
    {
      name: t('common.dashboard'),
      path: '/dashboard',
      icon: <HomeIcon />,
    },
    {
      name: t('members.title'),
      path: '/dashboard/members',
      icon: <PeopleIcon />,
    },
    {
      name: t('departments.title'),
      path: '/dashboard/departments',
      icon: <BusinessIcon />,
    },
    {
      name: t('positions.title'),
      path: '/dashboard/positions',
      icon: <WorkIcon />,
    },
    {
      name: t('analysis.title'),
      path: '/dashboard/analysis',
      icon: <AssessmentIcon />,
      adminOnly: true,
    },
    {
      name: t('reports.title'),
      path: '/dashboard/reports',
      icon: <AssessmentIcon />,
      adminOnly: true,
    },
    {
      name: t('common.settings'),
      path: '/dashboard/settings',
      icon: <SettingsIcon />,
    },
  ];

  // Get the current page title
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const matchedItem = navItems.find(
      (item) => 
        currentPath === item.path || 
        (item.path !== '/dashboard' && currentPath.startsWith(item.path))
    );
    return matchedItem?.name || t('common.dashboard');
  };

  // Handlers
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLanguageMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    handleLanguageMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close drawer when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setDrawerOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Drawer content component
  const drawerContent = (
    <>
      <Toolbar 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          minHeight: 64,
          bgcolor: 'error.main', // Red color for PSI branding
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 40, 
              height: 40, 
              bgcolor: 'white', 
              color: 'error.main',
              fontWeight: 'bold',
              fontSize: '1rem',
              mr: 2
            }}
          >
            PSI
          </Avatar>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            {t('common.appName')}
          </Typography>
        </Box>
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle} 
            size="small"
            sx={{ ml: 1, color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Toolbar>
      
      <Divider />
      
      <List component="nav" sx={{ px: 2, py: 1 }}>
        {navItems
          .filter((item) => !item.adminOnly || (user && user.role === 'admin'))
          .map((item) => {
            const isActive = 
              location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.path}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      color: '#D32F2F',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.15)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#D32F2F',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    minWidth: 40, 
                    color: isActive ? '#D32F2F' : 'inherit' 
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            );
          })}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider sx={{ mt: 'auto' }} />
      
      <Box sx={{ p: 2 }}>
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 2 
          }}
        >
          <Tooltip title={theme === 'dark' ? t('common.theme.light') : t('common.theme.dark')}>
            <IconButton 
              onClick={toggleTheme}
              size="small"
              sx={{ 
                borderRadius: 1.5,
                bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              {theme === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t('common.language')}>
            <IconButton 
              onClick={handleLanguageMenuOpen}
              size="small"
              sx={{ 
                borderRadius: 1.5,
                bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <LanguageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          
          <Tooltip title={t('auth.logout')}>
            <IconButton 
              onClick={handleLogout}
              size="small"
              sx={{ 
                borderRadius: 1.5,
                bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 1.5, 
            borderRadius: 2,
            bgcolor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Avatar 
            sx={{ 
              width: 36, 
              height: 36,
              bgcolor: '#D32F2F',
              fontSize: '1rem',
              mr: 1.5
            }}
          >
            {user?.name?.charAt(0) || user?.username?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" noWrap>
              {user?.name || user?.username}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.role === 'admin' ? t('common.admin') : t('common.user')}
            </Typography>
          </Box>
        </Paper>
      </Box>
      
      {/* Language Menu */}
      <Menu
        anchorEl={languageMenuAnchor}
        open={Boolean(languageMenuAnchor)}
        onClose={handleLanguageMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, width: 180, maxWidth: '100%' }
        }}
      >
        <MenuItem 
          selected={language === 'en'} 
          onClick={() => handleLanguageChange('en')}
          sx={{
            borderRadius: 1,
            mx: 1,
            width: 'calc(100% - 16px)',
            mb: 0.5
          }}
        >
          English
        </MenuItem>
        <MenuItem 
          selected={language === 'fr'} 
          onClick={() => handleLanguageChange('fr')}
          sx={{
            borderRadius: 1,
            mx: 1,
            width: 'calc(100% - 16px)',
            mb: 0.5
          }}
        >
          Français
        </MenuItem>
        <MenuItem 
          selected={language === 'ar'} 
          onClick={() => handleLanguageChange('ar')}
          sx={{
            borderRadius: 1,
            mx: 1,
            width: 'calc(100% - 16px)'
          }}
        >
          العربية
        </MenuItem>
      </Menu>
    </>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      
      {/* App Bar (mobile only) */}
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          display: { xs: 'block', lg: 'none' },
          width: '100%',
          bgcolor: 'error.main', // Red for PSI branding
          color: 'white',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, color: 'white' }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'white', 
                color: 'error.main',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                mr: 2
              }}
            >
              PSI
            </Avatar>
            <Typography variant="h6" noWrap component="div">
              {getCurrentPageTitle()}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: DRAWER_WIDTH,
            borderRight: 1,
            borderColor: 'divider',
          },
          zIndex: (theme) => theme.zIndex.drawer + 2,
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
          pt: { xs: 8, lg: 0 }, // Add padding on mobile for app bar
        }}
      >
        {/* Desktop Header */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            display: { xs: 'none', lg: 'block' },
            bgcolor: 'error.main', // Red for PSI branding
            color: 'white',
          }}
        >
          <Toolbar>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'medium' }}>
                {getCurrentPageTitle()}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            bgcolor: theme === 'dark' ? 'background.default' : 'grey.50',
            p: { xs: 2, sm: 3 } 
          }}
        >
          <Routes>
            <Route index element={<Dashboard />} />
            
            {/* Member Routes */}
            <Route path="members" element={<MembersListPage />} />
            <Route path="members/add" element={<MemberAddPage />} />
            <Route path="members/:id" element={<MemberDetailPage />} />
            <Route path="members/edit/:id" element={<MemberEditPage />} />
            
            {/* Department and Position Routes */}
            <Route path="departments" element={<DepartmentList />} />
            <Route path="positions" element={<PositionList />} />
            
            {/* Analysis and Reports */}
            <Route path="analysis" element={<Analysis />} />
            <Route path="reports" element={<Reports />} />
            
            {/* Settings */}
            <Route path="settings" element={<Settings />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;