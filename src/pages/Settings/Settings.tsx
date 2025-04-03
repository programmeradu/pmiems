import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  Stack,
  Tooltip,
  Chip
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as TranslateIcon,
  Person as PersonIcon,
  Lock as SecurityIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  Save as SaveIcon,
  Computer as SystemIcon,
  ColorLens as AppearanceIcon,
  Storage as DatabaseIcon,
  Backup as BackupIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
};

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme, toggleTheme } = useTheme();
  const { language, setLanguage, isRTL } = useApp();
  const { user } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(
    theme === 'light' ? 'light' : 'dark'
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackupsEnabled, setAutoBackupsEnabled] = useState(true);
  const [dataRetentionPeriod, setDataRetentionPeriod] = useState('90');
  const [densityMode, setDensityMode] = useState('standard');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // User profile form state
  const [userForm, setUserForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setLanguage(lang);
    
    // Show success notification
    setSuccess(t('settings.languageChanged'));
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(newTheme);
    
    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(newTheme);
    }
    
    // Show success notification
    setSuccess(t('settings.themeChanged'));
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real scenario, this would call an API to update the user profile
    // For now, we'll just show a success message
    setSuccess(t('settings.profileUpdated'));
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (userForm.newPassword !== userForm.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    
    // In a real scenario, this would call an API to update the password
    // For now, we'll just show a success message
    setSuccess(t('settings.passwordUpdated'));
    setTimeout(() => {
      setSuccess(null);
      
      // Reset password fields
      setUserForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }, 3000);
  };
  
  const handleExportDatabase = () => {
    setSuccess(t('settings.databaseExported'));
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handleImportDatabase = () => {
    setSuccess(t('settings.databaseImported'));
    setTimeout(() => setSuccess(null), 3000);
  };
  
  const handleBackup = () => {
    setSuccess(t('settings.backupCreated'));
    setTimeout(() => setSuccess(null), 3000);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('settings.title')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('settings.description')}
        </Typography>
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab icon={<AppearanceIcon />} label={t('settings.appearance')} {...a11yProps(0)} />
            <Tab icon={<PersonIcon />} label={t('settings.account')} {...a11yProps(1)} />
            <Tab icon={<SecurityIcon />} label={t('settings.security')} {...a11yProps(2)} />
            <Tab icon={<NotificationsIcon />} label={t('settings.notifications')} {...a11yProps(3)} />
            <Tab icon={<DatabaseIcon />} label={t('settings.data')} {...a11yProps(4)} />
            <Tab icon={<InfoIcon />} label={t('settings.about')} {...a11yProps(5)} />
          </Tabs>
        </Box>
        
        {/* Appearance Settings */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <TranslateIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    {t('settings.language')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="language-select-label">{t('settings.selectLanguage')}</InputLabel>
                    <Select
                      labelId="language-select-label"
                      value={selectedLanguage}
                      label={t('settings.selectLanguage')}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                    >
                      <MenuItem value="en">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '8px' }}>🇺🇸</span>
                          {t('settings.languages.en')}
                        </Box>
                      </MenuItem>
                      <MenuItem value="fr">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '8px' }}>🇫🇷</span>
                          {t('settings.languages.fr')}
                        </Box>
                      </MenuItem>
                      <MenuItem value="ar">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <span style={{ marginRight: '8px' }}>🇸🇦</span>
                          {t('settings.languages.ar')}
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.languageDescription')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {theme === 'dark' ? (
                      <DarkModeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    ) : (
                      <LightModeIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    )}
                    {t('settings.theme')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={2}>
                    <Paper
                      elevation={selectedTheme === 'light' ? 3 : 0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selectedTheme === 'light' ? 'primary.main' : 'divider',
                        bgcolor: selectedTheme === 'light' ? 'action.selected' : 'background.paper'
                      }}
                      onClick={() => handleThemeChange('light')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LightModeIcon sx={{ mr: 1 }} />
                        <Typography>{t('settings.lightMode')}</Typography>
                      </Box>
                    </Paper>
                    
                    <Paper
                      elevation={selectedTheme === 'dark' ? 3 : 0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selectedTheme === 'dark' ? 'primary.main' : 'divider',
                        bgcolor: selectedTheme === 'dark' ? 'action.selected' : 'background.paper'
                      }}
                      onClick={() => handleThemeChange('dark')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DarkModeIcon sx={{ mr: 1 }} />
                        <Typography>{t('settings.darkMode')}</Typography>
                      </Box>
                    </Paper>
                    
                    <Paper
                      elevation={selectedTheme === 'system' ? 3 : 0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1px solid',
                        borderColor: selectedTheme === 'system' ? 'primary.main' : 'divider',
                        bgcolor: selectedTheme === 'system' ? 'action.selected' : 'background.paper'
                      }}
                      onClick={() => handleThemeChange('system')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SystemIcon sx={{ mr: 1 }} />
                        <Typography>{t('settings.systemPreference')}</Typography>
                      </Box>
                    </Paper>
                  </Stack>
                  
                  <Box sx={{ mt: 3, mb: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={theme === 'dark'}
                          onChange={toggleTheme}
                          color="primary"
                        />
                      }
                      label={theme === 'dark' ? t('settings.darkMode') : t('settings.lightMode')}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.themeDescription')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.displayDensity')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel id="density-select-label">{t('settings.density')}</InputLabel>
                    <Select
                      labelId="density-select-label"
                      value={densityMode}
                      label={t('settings.density')}
                      onChange={(e) => setDensityMode(e.target.value)}
                    >
                      <MenuItem value="compact">{t('settings.densityCompact')}</MenuItem>
                      <MenuItem value="standard">{t('settings.densityStandard')}</MenuItem>
                      <MenuItem value="comfortable">{t('settings.densityComfortable')}</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.densityDescription')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Account Settings */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.profileSettings')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <form onSubmit={handleProfileSubmit}>
                    <Grid container spacing={3}>
                      <Grid xs={12} md={4} lg={3} sx={{ textAlign: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 120, 
                            height: 120, 
                            mx: 'auto', 
                            mb: 2,
                            bgcolor: 'primary.main'
                          }}
                        >
                          {user?.name?.charAt(0) || <PersonIcon fontSize="large" />}
                        </Avatar>
                        
                        <Button variant="outlined" size="small" sx={{ mb: 1 }}>
                          {t('settings.uploadPhoto')}
                        </Button>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {t('settings.photoRequirements')}
                        </Typography>
                      </Grid>
                      
                      <Grid xs={12} md={8} lg={9}>
                        <TextField
                          fullWidth
                          margin="normal"
                          label={t('settings.name')}
                          name="name"
                          value={userForm.name}
                          onChange={handleInputChange}
                        />
                        
                        <TextField
                          fullWidth
                          margin="normal"
                          label={t('settings.email')}
                          name="email"
                          type="email"
                          value={userForm.email}
                          onChange={handleInputChange}
                        />
                        
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            type="submit" 
                            variant="contained" 
                            color="primary"
                            startIcon={<SaveIcon />}
                          >
                            {t('settings.saveChanges')}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Security Settings */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.changePassword')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <form onSubmit={handlePasswordSubmit}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label={t('settings.currentPassword')}
                      name="currentPassword"
                      type="password"
                      value={userForm.currentPassword}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      margin="normal"
                      label={t('settings.newPassword')}
                      name="newPassword"
                      type="password"
                      value={userForm.newPassword}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <TextField
                      fullWidth
                      margin="normal"
                      label={t('settings.confirmPassword')}
                      name="confirmPassword"
                      type="password"
                      value={userForm.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        color="primary"
                        startIcon={<SaveIcon />}
                      >
                        {t('settings.updatePassword')}
                      </Button>
                    </Box>
                  </form>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Notification Settings */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.notificationSettings')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <List>
                    <ListItem divider>
                      <ListItemText 
                        primary={t('settings.enableNotifications')}
                        secondary={t('settings.notificationsDescription')}
                      />
                      <Switch
                        edge="end"
                        checked={notificationsEnabled}
                        onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                      />
                    </ListItem>
                    
                    <ListItem divider component="li" sx={{ opacity: notificationsEnabled ? 1 : 0.5 }}>
                      <ListItemText 
                        primary={t('settings.emailNotifications')}
                        secondary={t('settings.emailNotificationsDescription')}
                      />
                      <Switch
                        edge="end"
                        disabled={!notificationsEnabled}
                        defaultChecked
                      />
                    </ListItem>
                    
                    <ListItem divider component="li" sx={{ opacity: notificationsEnabled ? 1 : 0.5 }}>
                      <ListItemText 
                        primary={t('settings.desktopNotifications')}
                        secondary={t('settings.desktopNotificationsDescription')}
                      />
                      <Switch
                        edge="end"
                        disabled={!notificationsEnabled}
                        defaultChecked
                      />
                    </ListItem>
                    
                    <ListItem component="li" sx={{ opacity: notificationsEnabled ? 1 : 0.5 }}>
                      <ListItemText 
                        primary={t('settings.reportNotifications')}
                        secondary={t('settings.reportNotificationsDescription')}
                      />
                      <Switch
                        edge="end"
                        disabled={!notificationsEnabled}
                        defaultChecked
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Data Management */}
        <TabPanel value={tabValue} index={4}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.dataManagement')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<BackupIcon />}
                      onClick={handleExportDatabase}
                    >
                      {t('settings.exportData')}
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      startIcon={<BackupIcon />}
                      onClick={handleImportDatabase}
                    >
                      {t('settings.importData')}
                    </Button>
                  </Stack>
                  
                  <Typography variant="body2" color="text.secondary">
                    {t('settings.dataManagementDescription')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.backupSettings')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <List>
                    <ListItem divider>
                      <ListItemText 
                        primary={t('settings.enableAutoBackups')}
                        secondary={t('settings.backupsDescription')}
                      />
                      <Switch
                        edge="end"
                        checked={autoBackupsEnabled}
                        onChange={() => setAutoBackupsEnabled(!autoBackupsEnabled)}
                      />
                    </ListItem>
                    
                    <ListItem divider component="li" sx={{ opacity: autoBackupsEnabled ? 1 : 0.5 }}>
                      <ListItemText 
                        primary={t('settings.backupFrequency')}
                      />
                      <Select
                        value="daily"
                        disabled={!autoBackupsEnabled}
                        size="small"
                      >
                        <MenuItem value="daily">{t('settings.daily')}</MenuItem>
                        <MenuItem value="weekly">{t('settings.weekly')}</MenuItem>
                        <MenuItem value="monthly">{t('settings.monthly')}</MenuItem>
                      </Select>
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemText 
                        primary={t('settings.dataRetention')}
                        secondary={t('settings.dataRetentionDescription')}
                      />
                      <Select
                        value={dataRetentionPeriod}
                        onChange={(e) => setDataRetentionPeriod(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="30">{t('settings.days', { count: 30 })}</MenuItem>
                        <MenuItem value="60">{t('settings.days', { count: 60 })}</MenuItem>
                        <MenuItem value="90">{t('settings.days', { count: 90 })}</MenuItem>
                        <MenuItem value="180">{t('settings.days', { count: 180 })}</MenuItem>
                        <MenuItem value="365">{t('settings.days', { count: 365 })}</MenuItem>
                      </Select>
                    </ListItem>
                  </List>
                  
                  <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button 
                      variant="contained" 
                      startIcon={<BackupIcon />}
                      onClick={handleBackup}
                    >
                      {t('settings.createBackupNow')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* About */}
        <TabPanel value={tabValue} index={5}>
          <Grid container spacing={3}>
            <Grid xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.aboutSystem')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                      {t('common.appName')}
                    </Typography>
                    <Typography variant="subtitle1" color="primary">
                      {t('settings.version')} 1.0.0
                    </Typography>
                  </Box>
                  
                  <Typography variant="body1" paragraph>
                    {t('settings.aboutDescription')}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('settings.developed')}:</strong> {t('settings.companyName')}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    <strong>{t('settings.poweredBy')}:</strong> Electron, React, TypeScript, SQLite
                  </Typography>
                  
                  <Box sx={{ mt: 3 }}>
                    <Chip
                      icon={<InfoIcon />}
                      label={t('settings.viewLicense')}
                      variant="outlined"
                      clickable
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid xs={12} md={6}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {t('settings.systemInformation')}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <List>
                    <ListItem divider>
                      <ListItemText 
                        primary={t('settings.databaseSize')}
                        secondary="23.5 MB"
                      />
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemText 
                        primary={t('settings.lastBackup')}
                        secondary="2023-04-02 08:30:15"
                      />
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemText 
                        primary={t('settings.employees')}
                        secondary="142"
                      />
                    </ListItem>
                    
                    <ListItem divider>
                      <ListItemText 
                        primary={t('settings.departments')}
                        secondary="8"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemText 
                        primary={t('settings.positions')}
                        secondary="24"
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Box>
    </motion.div>
  );
};

export default Settings;