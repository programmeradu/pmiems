import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Box, 
  Button, 
  Typography, 
  Container, 
  Paper, 
  Link,
  CssBaseline 
} from '@mui/material';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme === 'dark' ? '#121212' : '#f5f5f5',
        p: 4
      }}
    >
      <CssBaseline />
      <Container maxWidth="sm">
        <Paper 
          elevation={6} 
          sx={{ 
            p: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            textAlign: 'center',
            bgcolor: theme === 'dark' ? '#1e1e1e' : '#ffffff'
          }}
        >
          <Typography 
            variant="h1" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '6rem',
              color: theme === 'dark' ? '#ffffff' : '#121212',
              mb: 2
            }}
          >
            404
          </Typography>
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              mb: 2,
              color: theme === 'dark' ? '#e0e0e0' : '#333333' 
            }}
          >
            {t('common.pageNotFound')}
          </Typography>
          
          <Typography 
            variant="body1" 
            sx={{ 
              mb: 4,
              color: theme === 'dark' ? '#a0a0a0' : '#666666',
            }}
          >
            {t('common.pageNotFoundDescription')}
          </Typography>
          
          <Button
            component={RouterLink}
            to={user ? '/dashboard' : '/login'}
            variant="contained"
            sx={{
              p: '10px 24px',
              bgcolor: '#6366F1',
              '&:hover': {
                bgcolor: '#4F46E5',
              }
            }}
          >
            {user ? t('common.backToDashboard') : t('common.backToHome')}
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default NotFound;