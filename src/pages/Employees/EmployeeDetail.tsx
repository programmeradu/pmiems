import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Divider,
  Avatar,
  Stack,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  Business as BusinessIcon,
  Today as TodayIcon,
  AttachMoney as MoneyIcon,
  Notes as NotesIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { Employee } from '../../types/Employee';
import { useTheme } from '../../context/ThemeContext';
import { getEmployeeById, deleteEmployee, formatEmployeeName, formatSalary, calculateTenure } from '../../services/employeeService';
import { useHelp } from '../../context/HelpContext';
import HelpTooltip from '../../components/common/HelpTooltip';
import { GridContainer, GridItem } from '../../components/common/GridComponents';

const EmployeeDetail: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const { showHelp } = useHelp();

  // State
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Delete confirmation
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load employee data
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        navigate('/dashboard/employees');
        return;
      }

      try {
        setIsLoading(true);
        const result = await getEmployeeById(parseInt(id));
        
        if (result.success && result.employee) {
          setEmployee(result.employee);
        } else {
          setError(result.message || t('common.error'));
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        setError(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, t]);

  const handleBack = () => {
    navigate('/dashboard/employees');
  };

  const handleEdit = () => {
    if (employee) {
      navigate(`/dashboard/employees/edit/${employee.id}`);
    }
  };

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!employee) return;
    
    try {
      setIsDeleting(true);
      const result = await deleteEmployee(employee.id);
      
      if (result.success) {
        setDeleteConfirmOpen(false);
        navigate('/dashboard/employees', { 
          state: { 
            message: t('employees.employeeDeleted'),
            severity: 'success' 
          } 
        });
      } else {
        setError(result.message || t('common.error'));
        setDeleteConfirmOpen(false);
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(t('common.error'));
      setDeleteConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            size="small" 
            sx={{ ml: 2 }} 
            onClick={handleBack}
          >
            {t('common.backToList')}
          </Button>
        </Alert>
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          {t('employees.employeeNotFound')}
          <Button 
            size="small" 
            sx={{ ml: 2 }} 
            onClick={handleBack}
          >
            {t('common.backToList')}
          </Button>
        </Alert>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
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
              onClick={handleBack}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
              {formatEmployeeName(employee)}
            </Typography>
          </Stack>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              {t('common.delete')}
            </Button>
          </Box>
        </Box>

        <GridContainer spacing={3}>
          {/* Left Column */}
          <GridItem xs={12} md={4}>
            {/* Profile Card */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  pt: 2, 
                  pb: 2 
                }}>
                  <Avatar
                    src={employee.profile_photo || undefined}
                    alt={formatEmployeeName(employee)}
                    sx={{ 
                      width: 120, 
                      height: 120, 
                      mb: 2,
                      bgcolor: employee.profile_photo ? 'transparent' : 'primary.main',
                      fontSize: '3rem'
                    }}
                  >
                    {!employee.profile_photo && (
                      <>
                        {employee.first_name[0]}{employee.last_name[0]}
                      </>
                    )}
                  </Avatar>
                  <Typography variant="h5" gutterBottom>
                    {formatEmployeeName(employee)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {employee.position_title || t('employees.noPosition')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {employee.department_name || t('employees.noDepartment')}
                  </Typography>
                  
                  <Box sx={{ mt: 2, width: '100%' }}>
                    <Divider sx={{ mb: 2 }} />
                    <Stack spacing={2}>
                      {employee.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon color="action" sx={{ mr: 2 }} />
                          <Typography variant="body2">
                            <a 
                              href={`mailto:${employee.email}`} 
                              style={{ 
                                color: 'inherit', 
                                textDecoration: 'none' 
                              }}
                            >
                              {employee.email}
                            </a>
                          </Typography>
                        </Box>
                      )}
                      
                      {employee.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon color="action" sx={{ mr: 2 }} />
                          <Typography variant="body2">
                            <a 
                              href={`tel:${employee.phone}`} 
                              style={{ 
                                color: 'inherit', 
                                textDecoration: 'none' 
                              }}
                            >
                              {employee.phone}
                            </a>
                          </Typography>
                        </Box>
                      )}
                      
                      {employee.address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <LocationIcon color="action" sx={{ mr: 2, mt: 0.5 }} />
                          <Typography variant="body2">
                            {employee.address}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Employment Details */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('employees.employmentDetails')}
                </Typography>
                <List disablePadding>
                  <ListItem disablePadding sx={{ pb: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <BusinessIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('employees.department')}
                      secondary={employee.department_name || t('common.notSpecified')}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ pb: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <WorkIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('employees.position')}
                      secondary={employee.position_title || t('common.notSpecified')}
                    />
                  </ListItem>
                  
                  <ListItem disablePadding sx={{ pb: 2 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <TodayIcon color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={t('employees.hireDate')}
                      secondary={
                        <>
                          {new Date(employee.hire_date).toLocaleDateString()}
                          <Typography 
                            component="span" 
                            variant="body2" 
                            sx={{ 
                              display: 'block', 
                              color: 'text.secondary',
                              mt: 0.5 
                            }}
                          >
                            {calculateTenure(employee.hire_date)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  
                  {employee.salary !== null && employee.salary !== undefined && (
                    <ListItem disablePadding>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <MoneyIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary={t('employees.salary')}
                        secondary={formatSalary(employee.salary)}
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </GridItem>

          {/* Right Column */}
          <GridItem xs={12} md={8}>
            {/* Notes */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotesIcon sx={{ mr: 1 }} color="action" />
                  <Typography variant="h6">
                    {t('employees.notes')}
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                {employee.notes ? (
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {employee.notes}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {t('employees.noNotes')}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Additional sections could be added here later */}
            {/* For example: Performance reviews, documents, timeline, etc. */}
          </GridItem>
        </GridContainer>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>{t('employees.deleteEmployee')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('employees.deleteConfirm')}
              <Typography component="span" fontWeight="bold" display="block" sx={{ mt: 1 }}>
                {formatEmployeeName(employee)}
              </Typography>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>{t('common.cancel')}</Button>
            <Button 
              onClick={handleDeleteConfirm} 
              color="error" 
              disabled={isDeleting}
              startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
            >
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default EmployeeDetail;