import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  TablePagination,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

import { Employee } from '../../types/Employee';
import { Department } from '../../types/Department';
import { Position } from '../../types/Position';
import { useTheme } from '../../context/ThemeContext';
import { getAllEmployees, deleteEmployee, formatEmployeeName, formatSalary, calculateTenure } from '../../services/employeeService';
import { getAllDepartments } from '../../services/departmentService';
import { getAllPositions } from '../../services/positionService';
import { useHelp } from '../../context/HelpContext';
import HelpTooltip from '../../components/common/HelpTooltip';

const EmployeeList: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { showHelp } = useHelp();

  // State for employee data
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filtering
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDepartment, setFilterDepartment] = useState<number | string>('');
  const [filterPosition, setFilterPosition] = useState<number | string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // State for pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // State for menu 
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Load employee data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const result = await getAllEmployees();
        
        if (result.success && result.employees) {
          setEmployees(result.employees);
          setFilteredEmployees(result.employees);
        } else {
          setError(result.message || t('common.error'));
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(t('common.error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [t]);

  // Load department and position data for filters
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        const departmentsResult = await getAllDepartments();
        if (departmentsResult.success && departmentsResult.departments) {
          setDepartments(departmentsResult.departments);
        }

        const positionsResult = await getAllPositions();
        if (positionsResult.success && positionsResult.positions) {
          setPositions(positionsResult.positions);
        }
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };

    fetchFiltersData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let result = [...employees];

    // Apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(employee => 
        employee.first_name.toLowerCase().includes(lowerQuery) ||
        employee.last_name.toLowerCase().includes(lowerQuery) ||
        (employee.email && employee.email.toLowerCase().includes(lowerQuery))
      );
    }

    // Apply department filter
    if (filterDepartment !== '') {
      result = result.filter(employee => 
        employee.department_id === Number(filterDepartment)
      );
    }

    // Apply position filter
    if (filterPosition !== '') {
      result = result.filter(employee => 
        employee.position_id === Number(filterPosition)
      );
    }

    setFilteredEmployees(result);
    setPage(0); // Reset to first page when filters change
  }, [employees, searchQuery, filterDepartment, filterPosition]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterReset = () => {
    setSearchQuery('');
    setFilterDepartment('');
    setFilterPosition('');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedEmployee(employee);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddEmployee = () => {
    navigate('/dashboard/employees/add');
  };

  const handleViewEmployee = (employee: Employee) => {
    handleMenuClose();
    navigate(`/dashboard/employees/${employee.id}`);
  };

  const handleEditEmployee = (employee: Employee) => {
    handleMenuClose();
    navigate(`/dashboard/employees/edit/${employee.id}`);
  };

  const handleDeleteClick = (employee: Employee) => {
    handleMenuClose();
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return;
    
    try {
      const result = await deleteEmployee(employeeToDelete.id);
      if (result.success) {
        setEmployees(prevEmployees => 
          prevEmployees.filter(e => e.id !== employeeToDelete.id)
        );
      } else {
        setError(result.message || t('common.error'));
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      setError(t('common.error'));
    } finally {
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setEmployeeToDelete(null);
  };

  // Empty state - no employees found
  if (!isLoading && filteredEmployees.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 3
            }}
          >
            <Typography variant="h4" component="h1">
              {t('employees.title')}
              {showHelp && <HelpTooltip helpKey="employees.list" />}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddEmployee}
            >
              {t('employees.addEmployee')}
            </Button>
          </Box>

          <Card
            sx={{
              height: '70vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              p: 4
            }}
          >
            <PersonAddIcon sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {searchQuery || filterDepartment || filterPosition
                ? t('employees.noFilterResults')
                : t('employees.noEmployees')}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
              {searchQuery || filterDepartment || filterPosition
                ? t('employees.adjustFilters')
                : t('employees.addEmployeePrompt')}
            </Typography>
            {(searchQuery || filterDepartment || filterPosition) ? (
              <Button 
                variant="outlined" 
                onClick={handleFilterReset}
              >
                {t('common.clearFilters')}
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleAddEmployee}
              >
                {t('employees.addEmployee')}
              </Button>
            )}
          </Card>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}
        >
          <Typography variant="h4" component="h1">
            {t('employees.title')}
            {showHelp && <HelpTooltip helpKey="employees.list" />}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddEmployee}
          >
            {t('employees.addEmployee')}
          </Button>
        </Box>

        {error && (
          <Box sx={{ mb: 3 }}>
            <Card sx={{ bgcolor: 'error.light', color: 'error.main' }}>
              <CardContent>
                <Typography>{error}</Typography>
                <Button 
                  size="small" 
                  sx={{ mt: 1 }} 
                  onClick={() => setError(null)}
                >
                  {t('common.dismiss')}
                </Button>
              </CardContent>
            </Card>
          </Box>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, maxWidth: 320 }}>
                <TextField
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                {showHelp && (
                  <HelpTooltip 
                    title={t('help.employees.search.title', 'Search Employees')}
                    content={t('help.employees.search.content', 'Type in this field to search employees by name, email, department or position.')}
                    iconOnly={true}
                    size="small"
                    placement="top"
                  />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    startIcon={<FilterIcon />}
                    variant={showFilters ? "contained" : "outlined"}
                    color={showFilters ? "primary" : "inherit"}
                    onClick={() => setShowFilters(!showFilters)}
                    size="small"
                  >
                    {t('common.filter')}
                  </Button>
                  {showHelp && (
                    <HelpTooltip 
                      title={t('help.employees.filter.title', 'Filtering Employees')}
                      content={t('help.employees.filter.content', 'Filter employees by department or position to find specific team members.')}
                      iconOnly={true}
                      size="small"
                      placement="top"
                    />
                  )}
                </Box>
                
                {(searchQuery || filterDepartment || filterPosition) && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      onClick={handleFilterReset}
                    >
                      {t('common.clearFilters')}
                    </Button>
                    {showHelp && (
                      <HelpTooltip 
                        title={t('help.employees.clearFilters.title', 'Clear Filters')}
                        content={t('help.employees.clearFilters.content', 'Click this button to clear all search and filter criteria and show all employees.')}
                        iconOnly={true}
                        size="small"
                        placement="top"
                      />
                    )}
                  </Box>
                )}
              </Box>
            </Box>

            {showFilters && (
              <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="department-filter-label">{t('employees.department')}</InputLabel>
                    <Select
                      labelId="department-filter-label"
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
                      label={t('employees.department')}
                    >
                      <MenuItem value="">{t('common.all')}</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>{dept.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {showHelp && (
                    <HelpTooltip 
                      title={t('help.employees.departmentFilter.title', 'Department Filter')}
                      content={t('help.employees.departmentFilter.content', 'Filter employees by their department. Select "All" to show employees from all departments.')}
                      iconOnly={true}
                      size="small"
                      placement="top"
                    />
                  )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel id="position-filter-label">{t('employees.position')}</InputLabel>
                    <Select
                      labelId="position-filter-label"
                      value={filterPosition}
                      onChange={(e) => setFilterPosition(e.target.value)}
                      label={t('employees.position')}
                    >
                      <MenuItem value="">{t('common.all')}</MenuItem>
                      {positions.map((pos) => (
                        <MenuItem key={pos.id} value={pos.id}>{pos.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {showHelp && (
                    <HelpTooltip 
                      title={t('help.employees.positionFilter.title', 'Position Filter')}
                      content={t('help.employees.positionFilter.content', 'Filter employees by their job position or title. Select "All" to show employees with any position.')}
                      iconOnly={true}
                      size="small"
                      placement="top"
                    />
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ overflow: 'hidden' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {t('employees.fullName')}
                      {showHelp && (
                        <HelpTooltip 
                          title={t('help.employees.name.title', 'Employee Name')}
                          content={t('help.employees.name.content', 'The full name of the employee. Click on a name to view detailed employee information.')}
                          iconOnly={true}
                          size="small"
                          placement="top"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{t('employees.email')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {t('employees.department')}
                      {showHelp && (
                        <HelpTooltip 
                          title={t('help.employees.department.title', 'Department')}
                          content={t('help.employees.department.content', 'The department the employee belongs to. Use the filter to find employees in a specific department.')}
                          iconOnly={true}
                          size="small"
                          placement="top"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {t('employees.position')}
                      {showHelp && (
                        <HelpTooltip 
                          title={t('help.employees.position.title', 'Position')}
                          content={t('help.employees.position.content', 'The job title or position of the employee within their department.')}
                          iconOnly={true}
                          size="small"
                          placement="top"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {t('employees.hireDate')}
                      {showHelp && (
                        <HelpTooltip 
                          title={t('help.employees.hireDate.title', 'Hire Date')}
                          content={t('help.employees.hireDate.content', 'The date when the employee joined the organization. Employee tenure is calculated from this date.')}
                          iconOnly={true}
                          size="small"
                          placement="top"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {t('common.actions')}
                      {showHelp && (
                        <HelpTooltip 
                          title={t('help.employees.actions.title', 'Actions')}
                          content={t('help.employees.actions.content', 'Click the menu icon to view, edit, or delete an employee record.')}
                          iconOnly={true}
                          size="small"
                          placement="top-end"
                        />
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee) => (
                    <TableRow
                      key={employee.id}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                        }
                      }}
                      onClick={() => handleViewEmployee(employee)}
                    >
                      <TableCell 
                        component="th" 
                        scope="row" 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Avatar
                          src={employee.profile_photo || undefined}
                          alt={formatEmployeeName(employee)}
                          sx={{ 
                            bgcolor: employee.profile_photo ? 'transparent' : 'primary.main',
                            width: 40,
                            height: 40
                          }}
                        >
                          {employee.first_name[0]}{employee.last_name[0]}
                        </Avatar>
                        <Box onClick={() => handleViewEmployee(employee)} sx={{ cursor: 'pointer' }}>
                          {formatEmployeeName(employee)}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              {calculateTenure(employee.hire_date)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{employee.email || '—'}</TableCell>
                      <TableCell>{employee.department_name || '—'}</TableCell>
                      <TableCell>{employee.position_title || '—'}</TableCell>
                      <TableCell>
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                        <IconButton 
                          size="small" 
                          onClick={(event) => handleMenuOpen(event, employee)}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredEmployees.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </TableContainer>
        )}

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {selectedEmployee && (
            <>
              <MenuItem onClick={() => handleViewEmployee(selectedEmployee)}>
                <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                {t('common.view')}
              </MenuItem>
              <MenuItem onClick={() => handleEditEmployee(selectedEmployee)}>
                <EditIcon fontSize="small" sx={{ mr: 1 }} />
                {t('common.edit')}
              </MenuItem>
              <MenuItem onClick={() => handleDeleteClick(selectedEmployee)}>
                <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                {t('common.delete')}
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={handleDeleteCancel}
        >
          <DialogTitle>{t('employees.deleteEmployee')}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t('employees.deleteConfirm')}
              {employeeToDelete && (
                <Typography component="span" fontWeight="bold" display="block" sx={{ mt: 1 }}>
                  {formatEmployeeName(employeeToDelete)}
                </Typography>
              )}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteCancel}>{t('common.cancel')}</Button>
            <Button onClick={handleDeleteConfirm} color="error" autoFocus>
              {t('common.delete')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </motion.div>
  );
};

export default EmployeeList;