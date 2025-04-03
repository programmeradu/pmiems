import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Divider,
  FormHelperText,
  IconButton,
  InputAdornment,
  Stack,
} from '@mui/material';

// Import Grid components
import { GridContainer, GridItem } from '../../components/common/GridComponents';
import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { Employee } from '../../types/Employee';
import { Department } from '../../types/Department';
import { Position } from '../../types/Position';
import { useTheme } from '../../context/ThemeContext';
import { getEmployeeById, createEmployee, updateEmployee } from '../../services/employeeService';
import { getAllDepartments } from '../../services/departmentService';
import { getPositionsByDepartment } from '../../services/positionService';
import { useHelp } from '../../context/HelpContext';
import HelpTooltip from '../../components/common/HelpTooltip';

const EmployeeForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const { showHelp } = useHelp();
  const isEditMode = Boolean(id);

  // State
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [availablePositions, setAvailablePositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Form validation schema
  const validationSchema = Yup.object({
    first_name: Yup.string()
      .required(t('validation.required', { field: t('employees.firstName') })),
    last_name: Yup.string()
      .required(t('validation.required', { field: t('employees.lastName') })),
    email: Yup.string()
      .email(t('validation.email')),
    department_id: Yup.number()
      .required(t('validation.required', { field: t('employees.department') })),
    position_id: Yup.number()
      .required(t('validation.required', { field: t('employees.position') })),
    hire_date: Yup.date()
      .required(t('validation.required', { field: t('employees.hireDate') })),
    salary: Yup.number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value))
      .positive(t('validation.positiveNumber', { field: t('employees.salary') })),
  });

  // Setup formik
  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      department_id: 0,
      position_id: 0,
      hire_date: new Date(),
      salary: null as number | null,
      notes: '',
    },
    validationSchema,
    onSubmit: (values) => handleSubmit(values),
    validateOnChange: true,
    validateOnBlur: true,
  });

  // Load data for edit mode
  useEffect(() => {
    const fetchData = async () => {
      if (isEditMode && id) {
        try {
          setIsLoading(true);
          const result = await getEmployeeById(parseInt(id));
          
          if (result.success && result.employee) {
            setEmployee(result.employee);
            
            // Update form values
            formik.setValues({
              first_name: result.employee.first_name,
              last_name: result.employee.last_name,
              email: result.employee.email || '',
              phone: result.employee.phone || '',
              address: result.employee.address || '',
              department_id: result.employee.department_id,
              position_id: result.employee.position_id,
              hire_date: new Date(result.employee.hire_date),
              salary: result.employee.salary || null,
              notes: result.employee.notes || '',
            });
            
            // Set profile photo if exists
            if (result.employee.profile_photo) {
              setProfilePhoto(result.employee.profile_photo);
            }
          } else {
            setError(result.message || t('common.error'));
          }
        } catch (err) {
          console.error('Error fetching employee:', err);
          setError(t('common.error'));
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [id, isEditMode, t]);

  // Load departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const result = await getAllDepartments();
        if (result.success && result.departments) {
          setDepartments(result.departments);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      }
    };

    fetchDepartments();
  }, []);

  // Load all positions
  useEffect(() => {
    const fetchAllPositions = async () => {
      try {
        const result = await getPositionsByDepartment(0); // 0 means all positions
        if (result.success && result.positions) {
          setPositions(result.positions);
        }
      } catch (err) {
        console.error('Error fetching positions:', err);
      }
    };

    fetchAllPositions();
  }, []);

  // Filter positions by department
  useEffect(() => {
    if (formik.values.department_id) {
      const filteredPositions = positions.filter(
        position => position.department_id === formik.values.department_id
      );
      setAvailablePositions(filteredPositions);
      
      // If current position is not in the new department, reset it
      if (
        formik.values.position_id &&
        !filteredPositions.some(p => p.id === formik.values.position_id)
      ) {
        formik.setFieldValue('position_id', 0);
      }
    } else {
      setAvailablePositions([]);
    }
  }, [formik.values.department_id, positions]);

  function handleSubmit(values: typeof formik.values) {
    const saveEmployee = async () => {
      try {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        // Prepare the employee data
        const employeeData: Partial<Employee> = {
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email || null,
          phone: values.phone || null,
          address: values.address || null,
          department_id: values.department_id,
          position_id: values.position_id,
          hire_date: values.hire_date.getTime(),
          salary: values.salary,
          notes: values.notes || null,
          profile_photo: profilePhoto,
        };

        let result;

        if (isEditMode && id) {
          // Update existing employee
          result = await updateEmployee({
            ...employeeData,
            id: parseInt(id),
          });
        } else {
          // Create new employee
          result = await createEmployee(employeeData);
        }

        if (result.success) {
          setSuccess(
            isEditMode
              ? t('employees.employeeUpdated')
              : t('employees.employeeAdded')
          );
          
          // Navigate back after successful save
          setTimeout(() => {
            navigate('/dashboard/employees');
          }, 1500);
        } else {
          setError(result.message || t('common.error'));
        }
      } catch (err) {
        console.error('Error saving employee:', err);
        setError(t('common.error'));
      } finally {
        setIsSaving(false);
      }
    };

    saveEmployee();
  }

  const handleCancel = () => {
    navigate('/dashboard/employees');
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          setProfilePhoto(e.target.result as string);
        }
      };
      
      reader.readAsDataURL(file);
      setPhotoFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoFile(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={handleCancel}
                size="small"
                sx={{ mr: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h4" component="h1">
                {isEditMode ? t('employees.editEmployee') : t('employees.addEmployee')}
                {showHelp && <HelpTooltip helpKey="employees.add" />}
              </Typography>
            </Stack>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <GridContainer spacing={3}>
              {/* Personal Information */}
              <GridItem xs={12} md={8}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('employees.personalInfo')}
                    </Typography>
                    <GridContainer spacing={2}>
                      <GridItem xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="first_name"
                          name="first_name"
                          label={t('employees.firstName')}
                          value={formik.values.first_name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.first_name && Boolean(formik.errors.first_name)}
                          helperText={formik.touched.first_name && formik.errors.first_name}
                          required
                        />
                      </GridItem>
                      <GridItem xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="last_name"
                          name="last_name"
                          label={t('employees.lastName')}
                          value={formik.values.last_name}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.last_name && Boolean(formik.errors.last_name)}
                          helperText={formik.touched.last_name && formik.errors.last_name}
                          required
                        />
                      </GridItem>
                      <GridItem xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="email"
                          name="email"
                          label={t('employees.email')}
                          value={formik.values.email}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.email && Boolean(formik.errors.email)}
                          helperText={formik.touched.email && formik.errors.email}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="phone"
                          name="phone"
                          label={t('employees.phone')}
                          value={formik.values.phone}
                          onChange={formik.handleChange}
                        />
                      </GridItem>
                      <GridItem xs={12}>
                        <TextField
                          fullWidth
                          id="address"
                          name="address"
                          label={t('employees.address')}
                          value={formik.values.address}
                          onChange={formik.handleChange}
                          multiline
                          rows={2}
                        />
                      </GridItem>
                    </GridContainer>
                  </CardContent>
                </Card>

                {/* Employment Information */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('employees.employmentInfo')}
                    </Typography>
                    <GridContainer spacing={2}>
                      <GridItem xs={12} sm={6}>
                        <FormControl 
                          fullWidth 
                          error={formik.touched.department_id && Boolean(formik.errors.department_id)}
                          required
                        >
                          <InputLabel id="department-label">{t('employees.department')}</InputLabel>
                          <Select
                            labelId="department-label"
                            id="department_id"
                            name="department_id"
                            value={formik.values.department_id || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label={t('employees.department')}
                          >
                            <MenuItem value={0}>{t('common.selectOne')}</MenuItem>
                            {departments.map(dept => (
                              <MenuItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.department_id && formik.errors.department_id && (
                            <FormHelperText>{formik.errors.department_id}</FormHelperText>
                          )}
                        </FormControl>
                      </GridItem>
                      <GridItem xs={12} sm={6}>
                        <FormControl 
                          fullWidth 
                          error={formik.touched.position_id && Boolean(formik.errors.position_id)}
                          required
                          disabled={!formik.values.department_id}
                        >
                          <InputLabel id="position-label">{t('employees.position')}</InputLabel>
                          <Select
                            labelId="position-label"
                            id="position_id"
                            name="position_id"
                            value={formik.values.position_id || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            label={t('employees.position')}
                          >
                            <MenuItem value={0}>{t('common.selectOne')}</MenuItem>
                            {availablePositions.map(pos => (
                              <MenuItem key={pos.id} value={pos.id}>
                                {pos.title}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.position_id && formik.errors.position_id ? (
                            <FormHelperText>{formik.errors.position_id}</FormHelperText>
                          ) : formik.values.department_id && availablePositions.length === 0 ? (
                            <FormHelperText>{t('employees.noPositionsInDepartment')}</FormHelperText>
                          ) : null}
                        </FormControl>
                      </GridItem>
                      <GridItem xs={12} sm={6}>
                        <DatePicker
                          label={t('employees.hireDate')}
                          value={formik.values.hire_date}
                          onChange={(date) => formik.setFieldValue('hire_date', date)}
                          slotProps={{
                            textField: {
                              fullWidth: true,
                              error: formik.touched.hire_date && Boolean(formik.errors.hire_date),
                              helperText: formik.touched.hire_date && formik.errors.hire_date as string,
                              required: true,
                            },
                          }}
                        />
                      </GridItem>
                      <GridItem xs={12} sm={6}>
                        <TextField
                          fullWidth
                          id="salary"
                          name="salary"
                          label={t('employees.salary')}
                          type="number"
                          value={formik.values.salary || ''}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.salary && Boolean(formik.errors.salary)}
                          helperText={formik.touched.salary && formik.errors.salary}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                        />
                      </GridItem>
                    </GridContainer>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('employees.notes')}
                    </Typography>
                    <TextField
                      fullWidth
                      id="notes"
                      name="notes"
                      label={t('employees.notes')}
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      multiline
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </GridItem>

              {/* Profile Photo and Actions */}
              <GridItem xs={12} md={4}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('employees.profilePhoto')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 150,
                          height: 150,
                          borderRadius: '50%',
                          bgcolor: 'grey.200',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                          mb: 2,
                          position: 'relative',
                        }}
                      >
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt={t('employees.profilePhoto')}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <Typography variant="body1" color="text.secondary">
                            {t('employees.noPhoto')}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          startIcon={<PhotoCameraIcon />}
                        >
                          {t('employees.uploadPhoto')}
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={handlePhotoUpload}
                          />
                        </Button>
                        {profilePhoto && (
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={handleRemovePhoto}
                            startIcon={<DeleteIcon />}
                          >
                            {t('employees.removePhoto')}
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 3 }}>
                      {t('common.actions')}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        type="submit"
                        disabled={isSaving || !formik.isValid}
                      >
                        {isSaving ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          t('common.save')
                        )}
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        {t('common.cancel')}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </GridItem>
            </GridContainer>
          </form>
        </Box>
      </LocalizationProvider>
    </motion.div>
  );
};

export default EmployeeForm;