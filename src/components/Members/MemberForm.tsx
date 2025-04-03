import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  Tabs,
  Tab,
  useTheme,
  Theme
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

import { Member, Department, Position } from '../../types';
import { createMember, updateMember, getMemberById } from '../../services/memberService';
import { getAllDepartments } from '../../services/departmentService';
import { getAllPositions, getPositionsByDepartment } from '../../services/positionService';

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
      id={`member-tabpanel-${index}`}
      aria-labelledby={`member-tab-${index}`}
      {...other}
      style={{ display: value === index ? 'block' : 'none' }}
    >
      {value === index && (
        <Box sx={{ p: 3, bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'white' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `member-tab-${index}`,
    'aria-controls': `member-tabpanel-${index}`,
  };
};

// Define a common text field style
const getTextFieldStyle = (theme: Theme) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.1)' : 'rgba(255, 255, 255, 0.09)'
});

// Define a common form control style
const getFormControlStyle = (theme: Theme) => ({
  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(50, 50, 50, 0.1)' : 'rgba(255, 255, 255, 0.09)'
});

// Define a common select style
const getSelectStyle = (theme: Theme) => ({
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.primary.main,
  }
});

const MemberForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const theme = useTheme();

  // Create form field styles using the theme
  const textFieldStyle = useMemo(() => getTextFieldStyle(theme), [theme]);
  const formControlStyle = useMemo(() => getFormControlStyle(theme), [theme]);
  const selectStyle = useMemo(() => getSelectStyle(theme), [theme]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [tabValue, setTabValue] = useState(0);

  const [formData, setFormData] = useState<Partial<Member>>({
    serial_number: '',
    first_name: '',
    last_name: '',
    other_names: '',
    sex: '',
    age: null,
    marital_status: '',
    email: '',
    contact_number: '',
    current_address: '',
    country_region: '',
    social_security_number: '',
    children_count: null,
    employer: '',
    employment_type: '',
    date_of_employment: null,
    place_of_work: '',
    department_id: null,
    position_id: null,
    membership_id: '',
    membership_date: null,
    membership_position: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDepartments = async () => {
      const result = await getAllDepartments();
      if (result.success && result.departments) {
        setDepartments(result.departments);
      }
    };

    const fetchPositions = async () => {
      const result = await getAllPositions();
      if (result.success && result.positions) {
        setPositions(result.positions);
      }
    };

    fetchDepartments();
    fetchPositions();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchMember = async () => {
        setLoading(true);
        const result = await getMemberById(parseInt(id));
        setLoading(false);

        if (result.success && result.member) {
          setFormData(result.member);

          // If department is selected, fetch related positions
          if (result.member.department_id) {
            const posResult = await getPositionsByDepartment(result.member.department_id);
            if (posResult.success && posResult.positions) {
              setPositions(posResult.positions);
            }
          }
        } else {
          setError(result.message || t('members.notFound'));
        }
      };

      fetchMember();
    }
  }, [id, isEditMode, t]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If department changed, update positions
    if (name === 'department_id' && value) {
      fetchPositionsByDepartment(value);
    }
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDateChange = (name: string, value: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [name]: value ? value.getTime() : null
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleNumberChange = (name: string, value: string) => {
    const numberValue = value === '' ? null : parseInt(value);
    setFormData(prev => ({
      ...prev,
      [name]: numberValue
    }));
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const fetchPositionsByDepartment = async (departmentId: number) => {
    const result = await getPositionsByDepartment(departmentId);
    if (result.success && result.positions) {
      setPositions(result.positions);
      // Clear position if it doesn't exist in the new department
      if (formData.position_id && !result.positions.some(p => p.id === formData.position_id)) {
        setFormData(prev => ({
          ...prev,
          position_id: null
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Basic required field validation
    if (!formData.first_name?.trim()) {
      errors.first_name = t('members.formErrors.firstNameRequired');
    }
    
    if (!formData.last_name?.trim()) {
      errors.last_name = t('members.formErrors.lastNameRequired');
    }
    
    if (!formData.serial_number?.trim()) {
      errors.serial_number = t('members.formErrors.serialNumberRequired');
    }
    
    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = t('members.formErrors.emailInvalid');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let result;
      
      if (isEditMode && id) {
        result = await updateMember({ ...formData, id: parseInt(id) });
      } else {
        result = await createMember(formData);
      }
      
      setLoading(false);
      
      if (result.success) {
        setSuccess(isEditMode ? t('members.memberUpdated') : t('members.memberAdded'));
        setTimeout(() => {
          navigate('/dashboard/members');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setLoading(false);
      setError(t('common.error'));
      console.error('Error saving member:', err);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/members');
  };

  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEditMode ? t('members.editMember') : t('members.addMember')}
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ my: 2 }}>
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 0, mb: 3, boxShadow: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="member form tabs"
          variant="fullWidth"
          sx={{
            bgcolor: 'primary.main',
            '& .MuiTab-root': { 
              color: 'white', 
              opacity: 0.7,
              padding: '16px 8px',
              fontWeight: 'bold',
              fontSize: '0.9rem',
            },
            '& .Mui-selected': { 
              color: 'white', 
              opacity: 1 
            }
          }}
          TabIndicatorProps={{
            style: { 
              backgroundColor: 'white',
              height: 3 
            }
          }}
        >
          <Tab label={t('members.tabs.demographics')} {...a11yProps(0)} />
          <Tab label={t('members.tabs.contactInfo')} {...a11yProps(1)} />
          <Tab label={t('members.tabs.employment')} {...a11yProps(2)} />
          <Tab label={t('members.tabs.membership')} {...a11yProps(3)} />
        </Tabs>

        {/* Demographics Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('members.tabs.demographics')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label={t('members.serialNumber')}
                name="serial_number"
                value={formData.serial_number || ''}
                onChange={handleChange}
                error={!!formErrors.serial_number}
                helperText={formErrors.serial_number}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label={t('members.firstName')}
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleChange}
                error={!!formErrors.first_name}
                helperText={formErrors.first_name}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label={t('members.lastName')}
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleChange}
                error={!!formErrors.last_name}
                helperText={formErrors.last_name}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.otherNames')}
                name="other_names"
                value={formData.other_names || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={formControlStyle}>
                <InputLabel>{t('members.sex')}</InputLabel>
                <Select
                  name="sex"
                  value={formData.sex || ''}
                  label={t('members.sex')}
                  onChange={handleSelectChange}
                  sx={selectStyle}
                >
                  <MenuItem value="male">{t('members.sexOptions.male')}</MenuItem>
                  <MenuItem value="female">{t('members.sexOptions.female')}</MenuItem>
                  <MenuItem value="other">{t('members.sexOptions.other')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.age')}
                name="age"
                type="number"
                value={formData.age === null ? '' : formData.age}
                onChange={(e) => handleNumberChange('age', e.target.value)}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={formControlStyle}>
                <InputLabel>{t('members.maritalStatus')}</InputLabel>
                <Select
                  name="marital_status"
                  value={formData.marital_status || ''}
                  label={t('members.maritalStatus')}
                  onChange={handleSelectChange}
                  sx={selectStyle}
                >
                  <MenuItem value="single">{t('members.maritalStatusOptions.single')}</MenuItem>
                  <MenuItem value="married">{t('members.maritalStatusOptions.married')}</MenuItem>
                  <MenuItem value="divorced">{t('members.maritalStatusOptions.divorced')}</MenuItem>
                  <MenuItem value="widowed">{t('members.maritalStatusOptions.widowed')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Contact Information Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('members.tabs.contactInfo')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.contactNumber')}
                name="contact_number"
                value={formData.contact_number || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.email')}
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('members.currentAddress')}
                name="current_address"
                value={formData.current_address || ''}
                onChange={handleChange}
                multiline
                rows={2}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.countryRegion')}
                name="country_region"
                value={formData.country_region || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.socialSecurityNumber')}
                name="social_security_number"
                value={formData.social_security_number || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.childrenCount')}
                name="children_count"
                type="number"
                value={formData.children_count === null ? '' : formData.children_count}
                onChange={(e) => handleNumberChange('children_count', e.target.value)}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Employment Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('members.tabs.employment')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.employer')}
                name="employer"
                value={formData.employer || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.employmentType')}
                name="employment_type"
                value={formData.employment_type || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label={t('members.dateOfEmployment')}
                value={formData.date_of_employment ? new Date(formData.date_of_employment) : null}
                onChange={(newValue) => handleDateChange('date_of_employment', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.date_of_employment,
                    helperText: formErrors.date_of_employment,
                    variant: "outlined",
                    sx: textFieldStyle
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.placeOfWork')}
                name="place_of_work"
                value={formData.place_of_work || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={formControlStyle}>
                <InputLabel>{t('members.department')}</InputLabel>
                <Select
                  name="department_id"
                  value={formData.department_id || ''}
                  label={t('members.department')}
                  onChange={handleSelectChange}
                  sx={selectStyle}
                >
                  <MenuItem value="">{t('members.selectDepartment')}</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.department_id} sx={formControlStyle}>
                <InputLabel>{t('members.position')}</InputLabel>
                <Select
                  name="position_id"
                  value={formData.position_id || ''}
                  label={t('members.position')}
                  onChange={handleSelectChange}
                  sx={selectStyle}
                >
                  <MenuItem value="">{t('members.selectPosition')}</MenuItem>
                  {positions
                    .filter(pos => !formData.department_id || pos.department_id === formData.department_id)
                    .map((pos) => (
                      <MenuItem key={pos.id} value={pos.id}>
                        {pos.title}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Membership Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                {t('members.tabs.membership')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.membershipId')}
                name="membership_id"
                value={formData.membership_id || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label={t('members.membershipDate')}
                value={formData.membership_date ? new Date(formData.membership_date) : null}
                onChange={(newValue) => handleDateChange('membership_date', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: "outlined",
                    sx: textFieldStyle
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('members.membershipPosition')}
                name="membership_position"
                value={formData.membership_position || ''}
                onChange={handleChange}
                variant="outlined"
                sx={textFieldStyle}
              />
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleCancel}
          startIcon={<CancelIcon />}
          sx={{ mr: 2 }}
        >
          {t('common.cancel')}
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
          disabled={loading}
        >
          {t('common.save')}
        </Button>
      </Box>
    </Box>
  );
};

export default MemberForm;