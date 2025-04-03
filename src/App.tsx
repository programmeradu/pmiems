import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { AppContextProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import { HelpProvider } from './context/HelpContext';
import Login from './components/Auth/Login';
import ForgotPassword from './components/Auth/ForgotPassword';
import NotFound from './components/common/NotFound';
import DashboardLayout from './layouts/DashboardLayout';
import { useAuth } from './context/AuthContext';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useTheme } from './context/ThemeContext';

/**
 * MUI Theme Provider that creates a theme based on current app theme
 */
const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();

  const muiTheme = createTheme({
    palette: {
      mode: theme as 'light' | 'dark',
      primary: {
        main: '#D32F2F', // PSI Red
      },
      secondary: {
        main: '#1976D2', // Blue accent
      },
      error: {
        main: '#D32F2F', // PSI Red (same as primary)
      },
      background: {
        default: theme === 'dark' ? '#121212' : '#f5f5f5',
        paper: theme === 'dark' ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: theme === 'dark' ? '#e0e0e0' : '#121212',
        secondary: theme === 'dark' ? '#a0a0a0' : '#71717A',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            boxShadow: theme === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });

  return (
    <MUIThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
};

/**
 * Protected Route component that redirects to login if not authenticated
 */
const ProtectedRoute: React.FC<{ element: React.ReactNode }> = ({ element }) => {
  const { user, isLoading } = useAuth();
  
  // Show loading screen if we're still checking auth state
  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{element}</>;
};

/**
 * Main App component that sets up providers and routing
 */
const App: React.FC = () => {
  return (
    <AppContextProvider>
      <CustomThemeProvider>
        <AppThemeProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <AuthProvider>
              <HelpProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard/*" element={<ProtectedRoute element={<DashboardLayout />} />} />
                    
                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Router>
              </HelpProvider>
            </AuthProvider>
          </LocalizationProvider>
        </AppThemeProvider>
      </CustomThemeProvider>
    </AppContextProvider>
  );
};

export default App;