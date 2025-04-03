import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Box,
  Grid as MuiGrid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Skeleton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  useTheme as useMuiTheme
} from '@mui/material';

import {
  PeopleAlt as PeopleIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  DateRange as DateRangeIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useHelp } from '../../context/HelpContext';
import { DashboardStats, Employee } from '../../types';
import { formatSalary, calculateTenure, formatEmployeeName } from '../../services/employeeService';
import { getDashboardStats } from '../../utils/ipc';
import AIInsightsPanel from '../../components/Dashboard/AIInsightsPanel';

// Define a Grid component that accepts 'item' prop as Material UI v5 no longer supports it directly
const Grid = (props: any) => <MuiGrid {...props} />;

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { theme } = useTheme();
  const muiTheme = useMuiTheme();
  const { showHelp } = useHelp();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await getDashboardStats();
        
        if (response.success && response.stats) {
          setStats(response.stats);
        } else {
          setError(response.message || t('dashboard.errors.loadFailed'));
        }
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(t('dashboard.errors.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [t]);

  const getChart = () => {
    if (!stats || !stats.departmentDistribution || stats.departmentDistribution.length === 0) {
      return null;
    }

    const backgroundColors = [
      'rgba(99, 102, 241, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(56, 189, 248, 0.8)',
      'rgba(216, 180, 254, 0.8)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(20, 184, 166, 0.8)',
    ];

    const borderColors = [
      'rgba(99, 102, 241, 1)',
      'rgba(34, 197, 94, 1)',
      'rgba(239, 68, 68, 1)',
      'rgba(249, 115, 22, 1)',
      'rgba(56, 189, 248, 1)',
      'rgba(216, 180, 254, 1)',
      'rgba(251, 146, 60, 1)',
      'rgba(20, 184, 166, 1)',
    ];

    const data = {
      labels: stats.departmentDistribution.map(d => d.name),
      datasets: [
        {
          data: stats.departmentDistribution.map(d => d.employee_count),
          backgroundColor: backgroundColors.slice(0, stats.departmentDistribution.length),
          borderColor: borderColors.slice(0, stats.departmentDistribution.length),
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
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    };

    return (
      <Box sx={{ height: 300, position: 'relative' }}>
        <Pie data={data} options={options} />
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Stat Cards Skeleton */}
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
          
          {/* Chart Skeleton */}
          <Grid item xs={12} md={6} lg={8}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
          </Grid>
          
          {/* Recent Hires Skeleton */}
          <Grid item xs={12} md={6} lg={4}>
            <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

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

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Grid container spacing={3}>
        {/* Welcome Message */}
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom fontWeight="medium">
            {t('dashboard.welcome', { name: user?.name || user?.username })}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {t('dashboard.overview')}
          </Typography>
        </Grid>

        {/* Stats */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: theme === 'dark' ? 'rgba(99, 102, 241, 0.08)' : 'rgba(99, 102, 241, 0.05)',
              border: '1px solid',
              borderColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)',
              height: '100%',
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    height: 40,
                    width: 40,
                    mr: 2,
                  }}
                >
                  <PeopleIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6">{t('employees.title')}</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {stats?.employeeCount || 0}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to="/dashboard/employees"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: theme === 'dark' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(34, 197, 94, 0.05)',
              border: '1px solid',
              borderColor: theme === 'dark' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)',
              height: '100%',
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'success.main',
                    height: 40,
                    width: 40,
                    mr: 2,
                  }}
                >
                  <BusinessIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6">{t('departments.title')}</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {stats?.departmentCount || 0}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to="/dashboard/departments"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: theme === 'dark' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(56, 189, 248, 0.05)',
              border: '1px solid',
              borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(56, 189, 248, 0.08)',
              height: '100%',
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'info.main',
                    height: 40,
                    width: 40,
                    mr: 2,
                  }}
                >
                  <WorkIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6">{t('positions.title')}</Typography>
              </Box>
              <Typography variant="h3" fontWeight="bold" sx={{ mb: 1 }}>
                {stats?.positionCount || 0}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  component={Link}
                  to="/dashboard/positions"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Department Distribution */}
        <Grid item xs={12} md={7} lg={8}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              height: '100%',
              minHeight: 400,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.employeesByDepartment')}
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {stats?.departmentDistribution && stats.departmentDistribution.length > 0 ? (
                <Box sx={{ height: 'calc(100% - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {getChart()}
                </Box>
              ) : (
                <Box sx={{ height: 'calc(100% - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary" align="center">
                    {t('dashboard.noEmployeeData')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Hires */}
        <Grid item xs={12} md={5} lg={4}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              height: '100%',
              minHeight: 400,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('dashboard.recentHires')}
              </Typography>
              <Divider sx={{ mb: 2 }} />

              {stats?.recentHires && stats.recentHires.length > 0 ? (
                <List disablePadding>
                  {stats.recentHires.map((employee) => (
                    <ListItem
                      key={employee.id}
                      alignItems="flex-start"
                      disablePadding
                      sx={{ 
                        py: 1.5, 
                        px: 0,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:last-child': {
                          borderBottom: 'none',
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {employee.first_name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" noWrap>
                            {formatEmployeeName(employee)}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" component="span" color="text.secondary" noWrap>
                              {employee.position_title || t('common.noPosition')}
                              {employee.department_name && ` • ${employee.department_name}`}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <DateRangeIcon sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary">
                                {t('dashboard.joined')}: {new Date(employee.hire_date).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="text.secondary" align="center">
                    {t('dashboard.noRecentHires')}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  component={Link}
                  to="/dashboard/employees"
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ textTransform: 'none' }}
                >
                  {t('common.viewAll')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* AI Insights Panel */}
        <Grid item xs={12}>
          <AIInsightsPanel showHelp={showHelp} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;