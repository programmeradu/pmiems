import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  MenuItem,
  Select,
  Tooltip,
  Stack,
  Chip
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useHelp } from '../../context/HelpContext';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import HelpTooltip from '../../components/common/HelpTooltip';

// Services and Types
import { 
  getAllPositions, 
  createPosition, 
  updatePosition, 
  deletePosition,
  getPositionsByDepartment
} from '../../services/positionService';
import { getAllDepartments } from '../../services/departmentService';
import { Position, Department } from '../../types';

// Form validation
import * as Yup from 'yup';
import { useFormik } from 'formik';

const PositionList: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { showHelp } = useHelp();
  
  // State for position list
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<number | 'all'>('all');
  
  // State for position form dialog
  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required(t('validation.required', { field: t('positions.title') }))
      .max(100, t('validation.maxLength', { field: t('positions.title'), max: 100 })),
    department_id: Yup.number()
      .required(t('validation.required', { field: t('departments.title') })),
    description: Yup.string()
      .nullable()
      .max(500, t('validation.maxLength', { field: t('positions.description'), max: 500 })),
  });

  // Initialize formik
  const formik = useFormik({
    initialValues: {
      id: 0,
      title: '',
      department_id: 0,
      description: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      handleFormSubmit(values);
    },
  });

  // Fetch positions and departments on mount
  useEffect(() => {
    Promise.all([
      fetchPositions(),
      fetchDepartments()
    ]);
  }, []);

  // Filter positions when search text or filter department changes
  useEffect(() => {
    filterPositions();
  }, [positions, searchText, filterDepartment]);

  // Fetch all positions
  const fetchPositions = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllPositions();
      
      if (result.success && result.positions) {
        setPositions(result.positions);
        setFilteredPositions(result.positions);
      } else {
        setError(result.message || t('common.error'));
      }
    } catch (err) {
      console.error('Error fetching positions:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  // Fetch all departments
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

  // Filter positions based on search text and selected department
  const filterPositions = () => {
    let filtered = [...positions];
    
    // Filter by department
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(pos => pos.department_id === filterDepartment);
    }
    
    // Filter by search text
    if (searchText.trim() !== '') {
      filtered = filtered.filter(
        pos => 
          pos.title.toLowerCase().includes(searchText.toLowerCase()) ||
          (pos.description && pos.description.toLowerCase().includes(searchText.toLowerCase())) ||
          (pos.department_name && pos.department_name.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    setFilteredPositions(filtered);
  };

  // Get department name by ID
  const getDepartmentName = (departmentId: number): string => {
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : t('common.unknown');
  };

  // Open form dialog for creating or editing position
  const handleOpenForm = (position?: Position) => {
    if (position) {
      setFormMode('edit');
      setSelectedPosition(position);
      formik.setValues({
        id: position.id,
        title: position.title,
        department_id: position.department_id,
        description: position.description || '',
      });
    } else {
      setFormMode('create');
      setSelectedPosition(null);
      formik.resetForm();
      formik.setValues({
        id: 0,
        title: '',
        department_id: departments.length > 0 ? departments[0].id : 0,
        description: '',
      });
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
        // Create new position
        const result = await createPosition({
          title: values.title,
          department_id: values.department_id,
          description: values.description || null,
        });
        
        if (result.success && result.position) {
          setPositions([...positions, result.position]);
          handleCloseForm();
        } else {
          setFormError(result.message || t('common.error'));
        }
      } else {
        // Update existing position
        const result = await updatePosition({
          id: values.id,
          title: values.title,
          department_id: values.department_id,
          description: values.description || null,
        });
        
        if (result.success && result.position) {
          setPositions(
            positions.map(pos => 
              pos.id === result.position!.id ? result.position! : pos
            )
          );
          handleCloseForm();
        } else {
          setFormError(result.message || t('common.error'));
        }
      }
    } catch (err) {
      console.error('Error submitting position form:', err);
      setFormError(t('common.error'));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (position: Position) => {
    setSelectedPosition(position);
    setDeleteError(null);
    setOpenDeleteDialog(true);
  };

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  // Delete a position
  const handleDeletePosition = async () => {
    if (!selectedPosition) return;
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      const result = await deletePosition(selectedPosition.id);
      
      if (result.success) {
        setPositions(positions.filter(pos => pos.id !== selectedPosition.id));
        handleCloseDeleteDialog();
      } else {
        setDeleteError(result.message || t('common.error'));
      }
    } catch (err) {
      console.error('Error deleting position:', err);
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
          {t('positions.title')}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{ borderRadius: 2 }}
          disabled={departments.length === 0}
        >
          {t('positions.addPosition')}
        </Button>
      </Box>

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and filter bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 2,
          border: '1px solid',
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
        }}
      >
        {/* Search field */}
        <Box sx={{ display: 'flex', alignItems: 'center', width: '60%' }}>
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField
            fullWidth
            variant="standard"
            placeholder={t('common.search')}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{ disableUnderline: true }}
          />
        </Box>
        
        {/* Department filter */}
        <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="filter-department-label">{t('departments.title')}</InputLabel>
          <Select
            labelId="filter-department-label"
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value as number | 'all')}
            label={t('departments.title')}
          >
            <MenuItem value="all">{t('common.all')}</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Departments table */}
      {filteredPositions.length > 0 ? (
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
                    {t('positions.title')}
                    {showHelp && (
                      <HelpTooltip
                        helpKey="positions.titleColumn"
                        size="small"
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t('departments.title')}
                    {showHelp && (
                      <HelpTooltip
                        helpKey="positions.departmentColumn"
                        size="small"
                      />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {t('positions.description')}
                    {showHelp && (
                      <HelpTooltip
                        helpKey="positions.descriptionColumn"
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
                        helpKey="positions.actionsColumn"
                        size="small"
                      />
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPositions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <WorkIcon sx={{ mr: 1, color: 'primary.main', opacity: 0.7 }} />
                      <Typography variant="body1">{position.title}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={<BusinessIcon />} 
                      label={position.department_name || getDepartmentName(position.department_id)}
                      size="small"
                      sx={{ 
                        bgcolor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                        color: 'primary.main',
                        fontWeight: 500,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {position.description || (
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        {t('common.noData')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common.edit')}>
                      <IconButton 
                        onClick={() => handleOpenForm(position)}
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
                        onClick={() => handleOpenDeleteDialog(position)}
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
          <WorkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.7 }} />
          <Typography variant="h6" gutterBottom>
            {t('positions.noPositions')}
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            {searchText || filterDepartment !== 'all' 
              ? t('common.noSearchResults') 
              : t('positions.noPositionsDescription')}
          </Typography>
          {(searchText || filterDepartment !== 'all') && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setSearchText('');
                setFilterDepartment('all');
              }}
              sx={{ mt: 1 }}
            >
              {t('common.clearFilters')}
            </Button>
          )}
        </Paper>
      )}

      {/* Create/Edit Position Dialog */}
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
            {formMode === 'create' ? t('positions.addPosition') : t('positions.editPosition')}
          </DialogTitle>
          
          <DialogContent dividers>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Position Title */}
              <FormControl 
                fullWidth 
                variant="outlined" 
                error={Boolean(formik.touched.title && formik.errors.title)}
              >
                <InputLabel htmlFor="position-title">
                  {t('positions.title')} *
                </InputLabel>
                <OutlinedInput
                  id="position-title"
                  name="title"
                  label={t('positions.title') + ' *'}
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.title && formik.errors.title && (
                  <Typography variant="caption" color="error">
                    {formik.errors.title}
                  </Typography>
                )}
              </FormControl>
              
              {/* Department */}
              <FormControl 
                fullWidth 
                variant="outlined"
                error={Boolean(formik.touched.department_id && formik.errors.department_id)}
              >
                <InputLabel id="department-label">
                  {t('departments.title')} *
                </InputLabel>
                <Select
                  labelId="department-label"
                  id="department_id"
                  name="department_id"
                  value={formik.values.department_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  label={t('departments.title') + ' *'}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                  ))}
                </Select>
                {formik.touched.department_id && formik.errors.department_id && (
                  <Typography variant="caption" color="error">
                    {formik.errors.department_id}
                  </Typography>
                )}
              </FormControl>
              
              {/* Description */}
              <FormControl 
                fullWidth 
                variant="outlined"
                error={Boolean(formik.touched.description && formik.errors.description)}
              >
                <InputLabel htmlFor="position-description">
                  {t('positions.description')}
                </InputLabel>
                <OutlinedInput
                  id="position-description"
                  name="description"
                  label={t('positions.description')}
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  multiline
                  rows={4}
                />
                {formik.touched.description && formik.errors.description && (
                  <Typography variant="caption" color="error">
                    {formik.errors.description}
                  </Typography>
                )}
              </FormControl>
            </Box>
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
              disabled={formSubmitting || !formik.isValid}
              startIcon={formSubmitting ? <CircularProgress size={20} /> : null}
            >
              {formSubmitting ? t('common.saving') : t('common.save')}
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
          {t('positions.deletePosition')}
        </DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            {t('positions.deleteConfirmation', { 
              position: selectedPosition?.title 
            })}
          </DialogContentText>
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
            onClick={handleDeletePosition}
            variant="contained"
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            {deleteLoading ? t('common.deleting') : t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* No Departments Alert */}
      {departments.length === 0 && !loading && (
        <Alert severity="info" sx={{ mt: 3 }}>
          {t('positions.noDepartmentsWarning')}
        </Alert>
      )}
    </Box>
  );
};

export default PositionList;