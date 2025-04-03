import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid as MuiGrid,
  Paper,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Divider,
  Alert,
  Button,
  Skeleton,
  useTheme as useMuiTheme
} from '@mui/material';

// Define a Grid component that accepts Grid v1 props to work with the MUI Grid v2
const Grid = MuiGrid;

import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Equalizer as EqualizerIcon,
  Timeline as TimelineIcon,
  Money as MoneyIcon,
  WorkOutline as WorkOutlineIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Pie, PolarArea } from 'react-chartjs-2';

import { useTheme } from '../../context/ThemeContext';
import { Employee, Department, Position } from '../../types';
import { 
  calculateAverageSalaryByDepartment,
  calculateHeadcountByDepartment,
  calculateHeadcountByPosition,
  calculateAverageTenure,
  calculateSalaryDistribution,
  calculateEmployeeGrowth
} from '../../utils/analysisUtils';
import { formatSalary } from '../../services/employeeService';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// Analysis tabs interface
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
      id={`analysis-tabpanel-${index}`}
      aria-labelledby={`analysis-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ pt: 3, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `analysis-tab-${index}`,
    'aria-controls': `analysis-tabpanel-${index}`,
  };
};

// Colors for charts
const chartColors = {
  primary: 'rgba(99, 102, 241, 0.8)',
  secondary: 'rgba(34, 197, 94, 0.8)',
  warning: 'rgba(249, 115, 22, 0.8)',
  danger: 'rgba(239, 68, 68, 0.8)',
  info: 'rgba(56, 189, 248, 0.8)',
  purple: 'rgba(216, 180, 254, 0.8)',
  orange: 'rgba(251, 146, 60, 0.8)',
  teal: 'rgba(20, 184, 166, 0.8)',
};

const Analysis: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  
  // Analysis data states
  const [salaryByDepartment, setSalaryByDepartment] = useState<{ departmentId: number; name: string; averageSalary: number }[]>([]);
  const [headcountByDepartment, setHeadcountByDepartment] = useState<{ departmentId: number; name: string; headcount: number }[]>([]);
  const [headcountByPosition, setHeadcountByPosition] = useState<{ positionId: number; title: string; departmentName?: string; headcount: number }[]>([]);
  const [averageTenure, setAverageTenure] = useState<number>(0);
  const [salaryDistribution, setSalaryDistribution] = useState<{ range: string; count: number }[]>([]);
  const [employeeGrowth, setEmployeeGrowth] = useState<{ month: string; count: number }[]>([]);

  // Initialize empty arrays for data states
  const initializeEmptyData = () => {
    setEmployees([]);
    setDepartments([]);
    setPositions([]);
    setSalaryByDepartment([]);
    setHeadcountByDepartment([]);
    setHeadcountByPosition([]);
    setAverageTenure(0);
    setSalaryDistribution([]);
    setEmployeeGrowth([]);
    setError('Unable to load analysis data. Please make sure you have created employees, departments and positions first.');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all necessary data
        const employeesResponse = await window.electronAPI.getAllEmployees();
        const departmentsResponse = await window.electronAPI.getAllDepartments();
        const positionsResponse = await window.electronAPI.getAllPositions();
        
        if (employeesResponse.success && departmentsResponse.success && positionsResponse.success) {
          setEmployees(employeesResponse.employees || []);
          setDepartments(departmentsResponse.departments || []);
          setPositions(positionsResponse.positions || []);
          
          // Calculate analysis data
          if (employeesResponse.employees && departmentsResponse.departments && positionsResponse.positions) {
            const empData = employeesResponse.employees;
            const deptData = departmentsResponse.departments;
            const posData = positionsResponse.positions;
            
            setSalaryByDepartment(calculateAverageSalaryByDepartment(empData, deptData));
            setHeadcountByDepartment(calculateHeadcountByDepartment(empData, deptData));
            setHeadcountByPosition(calculateHeadcountByPosition(empData, posData));
            setAverageTenure(calculateAverageTenure(empData));
            setSalaryDistribution(calculateSalaryDistribution(empData));
            setEmployeeGrowth(calculateEmployeeGrowth(empData));
          }
        } else {
          console.error('API call failed, data could not be loaded');
          initializeEmptyData();
        }
      } catch (err) {
        console.error('Error fetching data for analysis:', err);
        initializeEmptyData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Chart configurations
  const getDepartmentSalaryChart = () => {
    const data = {
      labels: salaryByDepartment.map(dept => dept.name),
      datasets: [
        {
          label: t('analysis.averageSalary'),
          data: salaryByDepartment.map(dept => dept.averageSalary),
          backgroundColor: Object.values(chartColors).slice(0, salaryByDepartment.length),
          borderColor: 'rgba(255, 255, 255, 0.2)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: theme === 'dark' ? muiTheme.palette.text.secondary : undefined,
            callback: (value: number) => formatSalary(value),
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          ticks: {
            color: theme === 'dark' ? muiTheme.palette.text.secondary : undefined,
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const value = context.raw || 0;
              return `${t('analysis.averageSalary')}: ${formatSalary(value)}`;
            },
          },
        },
      },
    };

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Bar data={data} options={options as any} />
      </Box>
    );
  };

  const getHeadcountByDepartmentChart = () => {
    const data = {
      labels: headcountByDepartment.map(dept => dept.name),
      datasets: [
        {
          label: t('analysis.headcount'),
          data: headcountByDepartment.map(dept => dept.headcount),
          backgroundColor: Object.values(chartColors).slice(0, headcountByDepartment.length),
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: theme === 'dark' ? muiTheme.palette.text.primary : undefined,
            padding: 15,
            usePointStyle: true,
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} ${t('analysis.employees')} (${percentage}%)`;
            },
          },
        },
      },
    };

    return (
      <Box sx={{ height: 400, position: 'relative' }}>
        <Pie data={data} options={options as any} />
      </Box>
    );
  };

  const getHeadcountByPositionChart = () => {
    // Only show top 8 positions by headcount
    const topPositions = [...headcountByPosition]
      .sort((a, b) => b.headcount - a.headcount)
      .slice(0, 8);

    const data = {
      labels: topPositions.map(pos => pos.title),
      datasets: [
        {
          label: t('analysis.headcount'),
          data: topPositions.map(pos => pos.headcount),
          backgroundColor: Object.values(chartColors).slice(0, topPositions.length),
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          labels: {
            color: theme === 'dark' ? muiTheme.palette.text.primary : undefined,
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const label = context.label || '';
              const value = context.raw || 0;
              const position = topPositions[context.dataIndex];
              return [
                `${t('analysis.headcount')}: ${value}`,
                position.departmentName ? `${t('departments.title')}: ${position.departmentName}` : '',
              ].filter(Boolean);
            },
          },
        },
      },
    };

    return (
      <Box sx={{ height: 400, position: 'relative' }}>
        <PolarArea data={data} options={options as any} />
      </Box>
    );
  };

  const getSalaryDistributionChart = () => {
    const data = {
      labels: salaryDistribution.map(item => item.range),
      datasets: [
        {
          label: t('analysis.employees'),
          data: salaryDistribution.map(item => item.count),
          backgroundColor: chartColors.primary,
          borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: theme === 'dark' ? muiTheme.palette.text.secondary : undefined,
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          ticks: {
            color: theme === 'dark' ? muiTheme.palette.text.secondary : undefined,
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    };

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Bar data={data} options={options as any} />
      </Box>
    );
  };

  const getEmployeeGrowthChart = () => {
    const data = {
      labels: employeeGrowth.map(item => item.month),
      datasets: [
        {
          label: t('analysis.employeeCount'),
          data: employeeGrowth.map(item => item.count),
          fill: true,
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderColor: chartColors.primary,
          tension: 0.3,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: theme === 'dark' ? muiTheme.palette.text.secondary : undefined,
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
        x: {
          ticks: {
            color: theme === 'dark' ? muiTheme.palette.text.secondary : undefined,
          },
          grid: {
            color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          },
        },
      },
      plugins: {
        legend: {
          labels: {
            color: theme === 'dark' ? muiTheme.palette.text.primary : undefined,
          },
        },
      },
    };

    return (
      <Box sx={{ height: 400, width: '100%' }}>
        <Line data={data} options={options as any} />
      </Box>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 3 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => window.location.reload()}
            >
              {t('common.retry')}
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Render empty state if no employee data
  if (employees.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          {t('analysis.noEmployeeData')}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="medium">
          {t('analysis.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('analysis.subtitle')}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: theme === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
              border: '1px solid',
              borderColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme === 'dark' 
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">{t('analysis.totalEmployees')}</Typography>
                <PeopleIcon fontSize="medium" color="primary" />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {employees.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: theme === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)',
              border: '1px solid',
              borderColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme === 'dark' 
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">{t('analysis.departments')}</Typography>
                <BusinessIcon fontSize="medium" color="success" />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {departments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: theme === 'dark' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.05)',
              border: '1px solid',
              borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.08)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme === 'dark' 
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">{t('analysis.positions')}</Typography>
                <WorkOutlineIcon fontSize="medium" color="info" />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {positions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: theme === 'dark' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(249, 115, 22, 0.05)',
              border: '1px solid',
              borderColor: theme === 'dark' ? 'rgba(249, 115, 22, 0.12)' : 'rgba(249, 115, 22, 0.08)',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme === 'dark' 
                  ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' 
                  : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Typography variant="h6">{t('analysis.avgTenure')}</Typography>
                <TimelineIcon fontSize="medium" sx={{ color: '#F97316' }} />
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {averageTenure}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('analysis.months')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Panel */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          mt: 2,
          overflow: 'hidden',
          height: '100%',
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="analysis tabs"
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 'medium',
                  minHeight: 48,
                  px: 3,
                },
              }}
            >
              <Tab 
                label={t('analysis.tabs.overview')} 
                {...a11yProps(0)} 
                icon={<EqualizerIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={t('analysis.tabs.departments')} 
                {...a11yProps(1)} 
                icon={<BusinessIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={t('analysis.tabs.positions')} 
                {...a11yProps(2)} 
                icon={<WorkOutlineIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={t('analysis.tabs.salary')} 
                {...a11yProps(3)} 
                icon={<MoneyIcon />} 
                iconPosition="start"
              />
              <Tab 
                label={t('analysis.tabs.growth')} 
                {...a11yProps(4)} 
                icon={<TrendingUpIcon />} 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('analysis.departmentHeadcount')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {getHeadcountByDepartmentChart()}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('analysis.employeeGrowth')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {getEmployeeGrowthChart()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Departments Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('analysis.departmentSalary')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {getDepartmentSalaryChart()}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider', mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('analysis.departmentHeadcount')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {getHeadcountByDepartmentChart()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Positions Tab */}
          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('analysis.positionHeadcount')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {getHeadcountByPositionChart()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Salary Tab */}
          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('analysis.salaryDistribution')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {getSalaryDistributionChart()}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider', mt: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('analysis.departmentSalary')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {getDepartmentSalaryChart()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          {/* Growth Tab */}
          <TabPanel value={tabValue} index={4}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ height: '100%', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('analysis.employeeGrowth')}
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {getEmployeeGrowthChart()}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </Box>
      </Paper>

      {/* Export Options */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          color="primary" 
          sx={{ mr: 2 }}
          onClick={() => alert('CSV Export would be implemented here')}
          // This would be connected to a real export function in a production app
        >
          {t('analysis.exportCSV')}
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => alert('PDF Export would be implemented here')}
          // This would be connected to a real export function in a production app
        >
          {t('analysis.exportPDF')}
        </Button>
      </Box>
    </Box>
  );
};

export default Analysis;