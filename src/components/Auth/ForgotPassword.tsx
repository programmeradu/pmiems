import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert, 
  Stack,
  Link as MuiLink,
  Divider,
  CssBaseline 
} from '@mui/material';

const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const { resetPassword, isLoading } = useAuth();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!username.trim()) {
      setMessage({
        text: t('validation.required', { field: t('auth.username') }),
        type: 'error'
      });
      return;
    }
    
    try {
      const result = await resetPassword(username);
      if (result.success) {
        setMessage({
          text: result.message,
          type: 'success'
        });
        setUsername(''); // Clear the form on success
      } else {
        setMessage({
          text: result.message,
          type: 'error'
        });
      }
    } catch (err) {
      setMessage({
        text: t('common.error'),
        type: 'error'
      });
      console.error(err);
    }
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        bgcolor: theme === 'dark' ? '#121212' : '#f5f5f5',
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
            bgcolor: theme === 'dark' ? '#1e1e1e' : '#ffffff'
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              fontWeight: 'bold',
              color: theme === 'dark' ? '#ffffff' : '#121212',
              mb: 1
            }}
          >
            {t('common.appName')}
          </Typography>
          
          <Typography 
            component="h2" 
            variant="h5" 
            sx={{ 
              mb: 1,
              color: theme === 'dark' ? '#e0e0e0' : '#333333' 
            }}
          >
            {t('auth.resetPassword')}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              mb: 3,
              color: theme === 'dark' ? '#a0a0a0' : '#666666',
              textAlign: 'center'
            }}
          >
            {t('auth.resetInstructions')}
          </Typography>
          
          {message && (
            <Alert 
              severity={message.type} 
              sx={{ 
                width: '100%', 
                mb: 2,
                '& .MuiAlert-message': {
                  color: message.type === 'error' 
                    ? theme === 'dark' ? '#f5c2c7' : '#842029' 
                    : theme === 'dark' ? '#badbcc' : '#0f5132'
                }
              }}
            >
              {message.text}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleResetPassword} sx={{ width: '100%' }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                id="username"
                name="username"
                label={t('auth.username')}
                variant="outlined"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#555' : '#ddd',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme === 'dark' ? '#aaa' : '#666',
                  },
                  '& .MuiInputBase-input': {
                    color: theme === 'dark' ? '#fff' : '#000',
                  },
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <MuiLink 
                  component={Link} 
                  to="/login" 
                  sx={{ 
                    color: '#6366F1',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    }
                  }}
                >
                  {t('auth.backToLogin')}
                </MuiLink>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 1,
                  p: 1.5,
                  bgcolor: '#6366F1',
                  '&:hover': {
                    bgcolor: '#4F46E5',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#6366F1',
                    opacity: 0.7,
                  }
                }}
              >
                {isLoading ? t('common.loading') : t('auth.resetButton')}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;