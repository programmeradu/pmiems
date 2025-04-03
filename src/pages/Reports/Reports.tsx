import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme as useMuiTheme, Theme } from '@mui/material/styles';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  LinearProgress,
  Alert,
  Chip,
  useMediaQuery
} from '@mui/material';
import {
  FilterAlt as FilterIcon,
  Assignment as ReportIcon,
  Refresh as ResetIcon,
  Preview as PreviewIcon,
  GetApp as ExportIcon,
  Print as PrintIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

import { useTheme } from '../../context/ThemeContext';
import { Employee, Department, Position } from '../../types';
import { formatEmployeeName, formatSalary } from '../../services/employeeService';
import { exportToCSV, formatReportDate, formatReportCurrency } from '../../services/reportService';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
  const printRef = useRef<HTMLDivElement>(null);
  
  // Report state
  const [reportType, setReportType] = useState<'employees' | 'departments' | 'positions'>('employees');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [generatedReport, setGeneratedReport] = useState<any[] | null>(null);
  const [reportColumns, setReportColumns] = useState<{ key: string; label: string }[]>([]);
  
  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch employees
        const employeesResponse = await window.electronAPI.getAllEmployees();
        if (employeesResponse.success && employeesResponse.employees) {
          setEmployees(employeesResponse.employees);
        }
        
        // Fetch departments
        const departmentsResponse = await window.electronAPI.getAllDepartments();
        if (departmentsResponse.success && departmentsResponse.departments) {
          setDepartments(departmentsResponse.departments);
        }
        
        // Fetch positions
        const positionsResponse = await window.electronAPI.getAllPositions();
        if (positionsResponse.success && positionsResponse.positions) {
          setPositions(positionsResponse.positions);
        }
      } catch (err) {
        console.error('Error fetching data for reports:', err);
        setError(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [t]);
  
  // Get available fields for the selected report type
  const getAvailableFields = () => {
    switch (reportType) {
      case 'employees':
        return [
          { key: 'id', label: t('reports.fields.id') },
          { key: 'first_name', label: t('reports.fields.firstName') },
          { key: 'last_name', label: t('reports.fields.lastName') },
          { key: 'email', label: t('reports.fields.email') },
          { key: 'phone', label: t('reports.fields.phone') },
          { key: 'department_name', label: t('reports.fields.department') },
          { key: 'position_title', label: t('reports.fields.position') },
          { key: 'hire_date', label: t('reports.fields.hireDate') },
          { key: 'salary', label: t('reports.fields.salary') },
          { key: 'tenure', label: t('reports.fields.tenure') },
        ];
      case 'departments':
        return [
          { key: 'id', label: t('reports.fields.id') },
          { key: 'name', label: t('reports.fields.name') },
          { key: 'description', label: t('reports.fields.description') },
          { key: 'employee_count', label: t('reports.fields.employeeCount') },
          { key: 'avg_salary', label: t('reports.fields.avgSalary') },
        ];
      case 'positions':
        return [
          { key: 'id', label: t('reports.fields.id') },
          { key: 'title', label: t('reports.fields.title') },
          { key: 'department_name', label: t('reports.fields.department') },
          { key: 'description', label: t('reports.fields.description') },
          { key: 'employee_count', label: t('reports.fields.employeeCount') },
        ];
      default:
        return [];
    }
  };
  
  // Handle field selection changes
  const handleFieldToggle = (field: string) => {
    if (selectedFields.includes(field)) {
      setSelectedFields(selectedFields.filter(f => f !== field));
    } else {
      setSelectedFields([...selectedFields, field]);
    }
  };
  
  // Handle report type change
  const handleReportTypeChange = (type: 'employees' | 'departments' | 'positions') => {
    setReportType(type);
    setSelectedFields([]);
    setGeneratedReport(null);
  };
  
  // Reset all filters
  const handleReset = () => {
    setDepartmentFilter('all');
    setPositionFilter('all');
    setStartDate(null);
    setEndDate(null);
    setSelectedFields([]);
    setGeneratedReport(null);
  };
  
  // Generate employee report
  const generateEmployeeReport = () => {
    let filteredEmployees = [...employees];
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      filteredEmployees = filteredEmployees.filter(
        emp => emp.department_id === parseInt(departmentFilter)
      );
    }
    
    // Apply position filter
    if (positionFilter !== 'all') {
      filteredEmployees = filteredEmployees.filter(
        emp => emp.position_id === parseInt(positionFilter)
      );
    }
    
    // Apply date filters
    if (startDate) {
      filteredEmployees = filteredEmployees.filter(
        emp => new Date(emp.hire_date) >= startDate
      );
    }
    
    if (endDate) {
      filteredEmployees = filteredEmployees.filter(
        emp => new Date(emp.hire_date) <= endDate
      );
    }
    
    // Map employees to report format with selected fields
    return filteredEmployees.map(employee => {
      const reportItem: Record<string, any> = {};
      
      // Only include selected fields
      selectedFields.forEach(field => {
        switch (field) {
          case 'id':
            reportItem.id = employee.id;
            break;
          case 'first_name':
            reportItem.first_name = employee.first_name;
            break;
          case 'last_name':
            reportItem.last_name = employee.last_name;
            break;
          case 'email':
            reportItem.email = employee.email;
            break;
          case 'phone':
            reportItem.phone = employee.phone;
            break;
          case 'department_name':
            reportItem.department_name = employee.department_name;
            break;
          case 'position_title':
            reportItem.position_title = employee.position_title;
            break;
          case 'hire_date':
            reportItem.hire_date = formatReportDate(employee.hire_date);
            break;
          case 'salary':
            reportItem.salary = formatReportCurrency(employee.salary);
            break;
          case 'tenure':
            const hireDate = new Date(employee.hire_date);
            const now = new Date();
            const diffYears = now.getFullYear() - hireDate.getFullYear();
            const diffMonths = now.getMonth() - hireDate.getMonth();
            reportItem.tenure = `${diffYears} ${t('reports.years')} ${diffMonths} ${t('reports.months')}`;
            break;
        }
      });
      
      return reportItem;
    });
  };
  
  // Generate department report
  const generateDepartmentReport = () => {
    return departments.map(department => {
      const deptEmployees = employees.filter(emp => emp.department_id === department.id);
      const reportItem: Record<string, any> = {};
      
      selectedFields.forEach(field => {
        switch (field) {
          case 'id':
            reportItem.id = department.id;
            break;
          case 'name':
            reportItem.name = department.name;
            break;
          case 'description':
            reportItem.description = department.description || '-';
            break;
          case 'employee_count':
            reportItem.employee_count = deptEmployees.length;
            break;
          case 'avg_salary':
            const validSalaries = deptEmployees
              .filter(emp => emp.salary !== null)
              .map(emp => emp.salary as number);
            
            const avgSalary = validSalaries.length
              ? validSalaries.reduce((acc, salary) => acc + salary, 0) / validSalaries.length
              : 0;
            
            reportItem.avg_salary = formatReportCurrency(avgSalary);
            break;
        }
      });
      
      return reportItem;
    });
  };
  
  // Generate position report
  const generatePositionReport = () => {
    return positions.map(position => {
      const posEmployees = employees.filter(emp => emp.position_id === position.id);
      const reportItem: Record<string, any> = {};
      
      selectedFields.forEach(field => {
        switch (field) {
          case 'id':
            reportItem.id = position.id;
            break;
          case 'title':
            reportItem.title = position.title;
            break;
          case 'department_name':
            const dept = departments.find(d => d.id === position.department_id);
            reportItem.department_name = dept ? dept.name : '-';
            break;
          case 'description':
            reportItem.description = position.description || '-';
            break;
          case 'employee_count':
            reportItem.employee_count = posEmployees.length;
            break;
        }
      });
      
      return reportItem;
    });
  };
  
  // Generate the report
  const handleGenerateReport = () => {
    if (selectedFields.length === 0) {
      setError(t('reports.noFieldsSelected'));
      return;
    }
    
    setError(null);
    setGenerating(true);
    
    try {
      let reportData: any[] = [];
      
      // Get selected columns
      const columns = getAvailableFields().filter(field => selectedFields.includes(field.key));
      setReportColumns(columns);
      
      // Generate report based on type
      switch (reportType) {
        case 'employees':
          reportData = generateEmployeeReport();
          break;
        case 'departments':
          reportData = generateDepartmentReport();
          break;
        case 'positions':
          reportData = generatePositionReport();
          break;
      }
      
      setGeneratedReport(reportData);
    } catch (err) {
      console.error('Error generating report:', err);
      setError(t('reports.generationError'));
    } finally {
      setGenerating(false);
    }
  };
  
  // Export to CSV
  const handleExportCSV = () => {
    if (!generatedReport || !reportColumns) return;
    
    const filename = `${reportType}_report_${format(new Date(), 'yyyy-MM-dd')}`;
    const csvContent = exportToCSV(generatedReport, reportColumns, filename);
    
    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Print report
  const handlePrint = () => {
    if (printRef.current) {
      const content = printRef.current;
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${t('reports.printTitle')} - ${format(new Date(), 'yyyy-MM-dd')}</title>
              <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>${t(`reports.types.${reportType}`)}</h1>
              ${content.innerHTML}
            </body>
          </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('reports.title')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {t('reports.description')}
        </Typography>
        
        {loading && <LinearProgress />}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Left area - report options */}
          <Grid xs={12} md={4} lg={3}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                height: '100%',
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('reports.reportOptions')}
                </Typography>
                
                {/* Report Type */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {t('reports.reportType')}
                  </Typography>
                  <div>
                    <Button
                      variant={reportType === 'employees' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleReportTypeChange('employees')}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      {t('reports.types.employees')}
                    </Button>
                    <Button
                      variant={reportType === 'departments' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleReportTypeChange('departments')}
                      sx={{ mr: 1, mb: 1 }}
                    >
                      {t('reports.types.departments')}
                    </Button>
                    <Button
                      variant={reportType === 'positions' ? 'contained' : 'outlined'}
                      size="small"
                      onClick={() => handleReportTypeChange('positions')}
                      sx={{ mb: 1 }}
                    >
                      {t('reports.types.positions')}
                    </Button>
                  </div>
                </Box>
                
                {/* Filters */}
                {reportType === 'employees' && (
                  <>
                    <Typography variant="subtitle2" gutterBottom>
                      {t('reports.filters.title')}
                    </Typography>
                    
                    <Stack spacing={2} sx={{ mb: 2 }}>
                      {/* Department Filter */}
                      <FormControl fullWidth size="small">
                        <InputLabel id="department-filter-label">
                          {t('reports.filters.department')}
                        </InputLabel>
                        <Select
                          labelId="department-filter-label"
                          value={departmentFilter}
                          onChange={(e) => setDepartmentFilter(e.target.value)}
                          label={t('reports.filters.department')}
                        >
                          <MenuItem value="all">{t('reports.filters.all')}</MenuItem>
                          {departments.map((dept) => (
                            <MenuItem key={dept.id} value={String(dept.id)}>
                              {dept.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {/* Position Filter */}
                      <FormControl fullWidth size="small">
                        <InputLabel id="position-filter-label">
                          {t('reports.filters.position')}
                        </InputLabel>
                        <Select
                          labelId="position-filter-label"
                          value={positionFilter}
                          onChange={(e) => setPositionFilter(e.target.value)}
                          label={t('reports.filters.position')}
                        >
                          <MenuItem value="all">{t('reports.filters.all')}</MenuItem>
                          {positions.map((pos) => (
                            <MenuItem key={pos.id} value={String(pos.id)}>
                              {pos.title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      
                      {/* Date Range */}
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <DatePicker
                            label={t('reports.filters.startDate')}
                            value={startDate}
                            onChange={(date) => setStartDate(date)}
                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                          />
                          <DatePicker
                            label={t('reports.filters.endDate')}
                            value={endDate}
                            onChange={(date) => setEndDate(date)}
                            slotProps={{ textField: { size: 'small', fullWidth: true } }}
                          />
                        </Box>
                      </LocalizationProvider>
                    </Stack>
                    
                    <Divider sx={{ my: 2 }} />
                  </>
                )}
                
                {/* Field Selection */}
                <Typography variant="subtitle2" gutterBottom>
                  {t('reports.fields.title')}
                </Typography>
                
                <FormGroup>
                  {getAvailableFields().map((field) => (
                    <FormControlLabel
                      key={field.key}
                      control={
                        <Checkbox
                          checked={selectedFields.includes(field.key)}
                          onChange={() => handleFieldToggle(field.key)}
                          size="small"
                        />
                      }
                      label={field.label}
                    />
                  ))}
                </FormGroup>
                
                <Divider sx={{ my: 2 }} />
                
                {/* Actions */}
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleGenerateReport}
                    disabled={selectedFields.length === 0 || generating}
                    startIcon={<PreviewIcon />}
                    fullWidth
                  >
                    {t('reports.generate')}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<ResetIcon />}
                  >
                    {t('reports.reset')}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Right area - report preview */}
          <Grid xs={12} md={8} lg={9}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6">
                  {t('reports.preview')}
                </Typography>
                {generatedReport && generatedReport.length > 0 && (
                  <Box>
                    <Tooltip title={t('reports.export')}>
                      <IconButton onClick={handleExportCSV} size="small">
                        <ExportIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('reports.print')}>
                      <IconButton onClick={handlePrint} size="small">
                        <PrintIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
              
              {generating && <LinearProgress />}
              
              <div ref={printRef}>
                <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
                  {generatedReport && generatedReport.length > 0 ? (
                    <Table stickyHeader aria-label="report table" size="small">
                      <TableHead>
                        <TableRow>
                          {reportColumns.map((column) => (
                            <TableCell key={column.key}>
                              <Typography variant="subtitle2">{column.label}</Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {generatedReport.map((row, index) => (
                          <TableRow key={index} hover>
                            {reportColumns.map((column) => (
                              <TableCell key={column.key}>
                                {row[column.key] !== undefined ? row[column.key] : '-'}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      {!generating && (
                        <>
                          <ReportIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                          <Typography variant="body1" color="text.secondary">
                            {selectedFields.length === 0 
                              ? t('reports.selectFieldsFirst')
                              : t('reports.noReportGenerated')}
                          </Typography>
                          {selectedFields.length > 0 && (
                            <Button 
                              variant="contained" 
                              onClick={handleGenerateReport}
                              startIcon={<PreviewIcon />}
                              sx={{ mt: 2 }}
                            >
                              {t('reports.generate')}
                            </Button>
                          )}
                        </>
                      )}
                    </Box>
                  )}
                </TableContainer>
                
                {generatedReport && generatedReport.length > 0 && (
                  <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('reports.totalRecords')}: {generatedReport.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('reports.generatedOn')}: {format(new Date(), 'PPP')}
                    </Typography>
                  </Box>
                )}
              </div>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </motion.div>
  );
};

export default Reports;