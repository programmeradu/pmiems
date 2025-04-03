import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  OutlinedInput,
  Grid,
  Tooltip,
  Stack
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useHelp } from '../../context/HelpContext';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import HelpTooltip from '../../components/common/HelpTooltip';

// Services and Types
import { 
  getAllDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment 
} from '../../services/departmentService';
import { Department } from '../../types/Department';

// Form validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

const DepartmentList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showHelp } = useHelp();
  
  // State for department list
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  
  // State for department form dialog
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('validation.required', { field: t('departments.name') }))
      .max(100, t('validation.maxLength', { field: t('departments.name'), max: 100 })),
    description: Yup.string()
      .nullable()
      .max(500, t('validation.maxLength', { field: t('departments.description'), max: 500 })),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      id: 0,
      name: '',
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      handleFormSubmit(values);
    },
  });

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter departments when search text changes
  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter(
        dept => 
          dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
          (dept.description && dept.description.toLowerCase().includes(searchText.toLowerCase()))
      );
      setFilteredDepartments(filtered);
    }
  }, [departments, searchText]);

  // Fetch all departments
  const fetchDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllDepartments();
      
      if (result.success && result.departments) {
        setDepartments(result.departments);
        setFilteredDepartments(result.departments);
      } else {
        setError(result.message || t('common.error'));
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Open form dialog for creating or editing department
  const handleOpenForm = (department?: Department) => {
    if (department) {
      setFormMode('edit');
      setSelectedDepartment(department);
      formik.setValues({
        id: department.id,
        name: department.name,
        description: department.description || '',
      });
    } else {
      setFormMode('create');
      setSelectedDepartment(null);
      formik.resetForm();
    }
    
    setFormError(null);
    setOpenForm(true);
  };

  // Close form dialog
  const handleCloseForm = () => {
    setOpenForm(false);
  };

  // Handle form submission (create or update)
  const handleFormSubmit = async (values: typeof formik.values) => {
    setFormSubmitting(true);
    setFormError(null);
    
    try {
      if (formMode === 'create') {
        // Create new department
        const result = await createDepartment({
          name: values.name,
          description: values.description || null,
        });
        
        if (result.success && result.department) {
          setDepartments([...departments, result.department]);
          handleCloseForm();
        } else {
          setFormError(result.message || t('common.error'));
        }
      } else {
        // Update existing department
        const result = await updateDepartment({
          id: values.id,
          name: values.name,
          description: values.description || null,
        });
        
        if (result.success && result.department) {
          setDepartments(
            departments.map(dept => 
              dept.id === result.department!.id ? result.department! : dept
            )
          );
          handleCloseForm();
        } else {
          setFormError(result.message || t('common.error'));
        }
      }
    } catch (err) {
      console.error('Error submitting department form:', err);
      setFormError(t('common.error'));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (department: Department) => {
    setSelectedDepartment(department);
    setDeleteError(null);
    setOpenDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Delete a department
  const handleDeleteDepartment = async () => {
    if (!selectedDepartment) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      const result = await deleteDepartment(selectedDepartment.id);
      
      if (result.success) {
        setDepartments(departments.filter(dept => dept.id !== selectedDepartment.id));
        handleCloseDeleteDialog();
      } else {
        setDeleteError(result.message || t('common.error'));
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      setDeleteError(t('common.error'));
    } finally {
      setDeleteLoading(false);
    }
  };

  // Show loading
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Page header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('departments.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ borderRadius: 2 }}
        >
          {t('departments.addDepartment')}
        </Button>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          border: '1px solid',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        }}
      >
        <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
        <TextField
          fullWidth
          variant="standard"
          placeholder={t('common.search')}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{ disableUnderline: true }}
        />
      </Paper>

      {/* Departments table */}
      {filteredDepartments.length > 0 ? (
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            mb: 3,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t('departments.name')}
                    {showHelp && (
                      <HelpTooltip
                        helpKey="departments.nameColumn"
                        size="small"
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t('departments.description')}
                    {showHelp && (
                      <HelpTooltip
                        helpKey="departments.descriptionColumn"
                        size="small"
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" alignItems="center" spacing={1} justifyContent="flex-end">
                    {t('common.actions')}
                    {showHelp && (
                      <HelpTooltip
                        helpKey="departments.actionsColumn"
                        size="small"
                      />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BusinessIcon sx={{ mr: 1, color: 'primary.main', opacity: 0.7 }} />
                      <Typography variant="body1">{department.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {department.description || (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {t('common.noData')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common.edit')}>
                      <IconButton 
                        onClick={() => handleOpenForm(department)}
                        size="small"
                        sx={{ 
                          color: 'primary.main',
                          mr: 1,
                          backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                          '&:hover': {
                            backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                          }
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')}>
                      <IconButton 
                        onClick={() => handleOpenDeleteDialog(department)}
                        size="small"
                        sx={{ 
                          color: 'error.main',
                          backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68,.05)',
                          '&:hover': {
                            backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            border: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            bgcolor: theme === 'dark' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)',
          }}
        >
          <BusinessIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" gutterBottom>
            {t('departments.noDepartments')}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            {searchText ? t('common.noSearchResults') : t('departments.noDepartmentsDescription')}
          </Typography>
          {searchText && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setSearchText('')}
              sx={{ mt: 1 }}
            >
              {t('common.clearSearch')}
            </Button>
          )}
        </Paper>
      )}

      {/* Create/Edit Department Dialog */}
      <Dialog 
        open={openForm} 
        onClose={formSubmitting ? undefined : handleCloseForm}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            {formMode === 'create' ? t('departments.addDepartment') : t('departments.editDepartment')}
          </DialogTitle>
          
          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            
            <Grid container spacing={3}>
              {/* Department Name */}
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  variant="outlined" 
                  error={Boolean(formik.touched.name && formik.errors.name)}
                >
                  <InputLabel htmlFor="department-name">
                    {t('departments.name')} *
                  </InputLabel>
                  <OutlinedInput
                    id="department-name"
                    name="name"
                    label={t('departments.name') + ' *'}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <Typography variant="caption" color="error">
                      {formik.errors.name}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              
              {/* Department Description */}
              <Grid item xs={12}>
                <FormControl 
                  fullWidth 
                  variant="outlined"
                  error={Boolean(formik.touched.description && formik.errors.description)}
                >
                  <InputLabel htmlFor="department-description">
                    {t('departments.description')}
                  </InputLabel>
                  <OutlinedInput
                    id="department-description"
                    name="description"
                    label={t('departments.description')}
                    multiline
                    rows={3}
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.touched.description && formik.errors.description && (
                    <Typography variant="caption" color="error">
                      {formik.errors.description}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={handleCloseForm} 
              color="inherit"
              disabled={formSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={formSubmitting}
              startIcon={formSubmitting ? <CircularProgress size={18} /> : null}
            >
              {formSubmitting 
                ? t('common.saving')
                : formMode === 'create' 
                  ? t('common.create') 
                  : t('common.save')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={deleteLoading ? undefined : handleCloseDeleteDialog}
        PaperProps={{
          elevation: 0,
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
          }
        }}
      >
        <DialogTitle>
          {t('departments.deleteDepartment')}
        </DialogTitle>
        
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          
          <DialogContentText>
            {t('departments.deleteConfirm')}
          </DialogContentText>
          
          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'medium' }}>
            {selectedDepartment?.name}
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDeleteDialog}
            color="inherit"
            disabled={deleteLoading}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleDeleteDepartment}
            color="error"
            variant="contained"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={18} /> : null}
          >
            {deleteLoading ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DepartmentList;