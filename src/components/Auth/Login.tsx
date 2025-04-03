import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
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
  IconButton,
  InputAdornment,
  CssBaseline
} from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError(t('validation.required', { field: t('auth.username') }));
      return;
    }
    
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || t('auth.invalidCredentials'));
      }
    } catch (err) {
      setError(t('common.error'));
      console.error(err);
    }
  };
  
  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
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
              mb: 3,
              color: theme === 'dark' ? '#e0e0e0' : '#333333' 
            }}
          >
            {t('auth.login')}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
            <Stack spacing={2}>
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
              
              <TextField
                fullWidth
                id="password"
                name="password"
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: theme === 'dark' ? '#aaa' : '#666' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <IconButton onClick={toggleTheme} sx={{ color: theme === 'dark' ? '#f5f5f5' : '#333' }}>
                  {theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
                
                <Button 
                  onClick={handleForgotPassword} 
                  sx={{ 
                    textTransform: 'none',
                    color: '#6366F1',
                    '&:hover': {
                      background: 'transparent',
                      color: '#4F46E5',
                    }
                  }}
                >
                  {t('auth.forgotPassword')}
                </Button>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 3,
                  mb: 2,
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
                {isLoading ? t('common.loading') : t('auth.loginButton')}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;