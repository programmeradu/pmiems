import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip as MuiTooltip,
  useTheme,
  Container,
  Stack
} from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import SchoolIcon from '@mui/icons-material/School';
import { useAuth } from '../../context/AuthContext';
import { useHelp } from '../../context/HelpContext';
import { useHelpContent } from '../../components/common/HelpContent';
import { HelpTooltip, GuidedTour, HelpButton } from '../../components/common';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const { showTour, setShowTour, currentTour, startTour, markTourCompleted } = useHelp();
  const helpContent = useHelpContent();
  
  const [employeeCount, setEmployeeCount] = useState<number>(0);
  const [departmentCount, setDepartmentCount] = useState<number>(0);
  const [positionCount, setPositionCount] = useState<number>(0);
  const [recentHires, setRecentHires] = useState<any[]>([]);
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  
  useEffect(() => {
    // For demonstration purposes, we're using mock data here
    // In a real application, this would come from the database
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    // Simulating a database fetch
    // In a real application, this would be replaced with a real API call
    
    // Fake department data for chart
    setDepartmentData([
      { department: 'Engineering', count: 12, color: '#6366F1' },
      { department: 'Marketing', count: 8, color: '#22C55E' },
      { department: 'Sales', count: 15, color: '#F59E0B' },
      { department: 'Human Resources', count: 5, color: '#EC4899' },
      { department: 'Finance', count: 7, color: '#8B5CF6' },
    ]);
    
    // Fake recent hires
    setRecentHires([
      { id: 1, name: 'John Doe', position: 'Software Engineer', department: 'Engineering', hireDate: Date.now() - 5 * 24 * 60 * 60 * 1000 },
      { id: 2, name: 'Jane Smith', position: 'Marketing Specialist', department: 'Marketing', hireDate: Date.now() - 10 * 24 * 60 * 60 * 1000 },
      { id: 3, name: 'Robert Johnson', position: 'Sales Representative', department: 'Sales', hireDate: Date.now() - 15 * 24 * 60 * 60 * 1000 },
    ]);
    
    // Set counts
    setEmployeeCount(47);
    setDepartmentCount(5);
    setPositionCount(18);
  };
  
  const chartData = {
    labels: departmentData.map(item => item.department),
    datasets: [
      {
        data: departmentData.map(item => item.count),
        backgroundColor: departmentData.map(item => item.color),
        borderWidth: 0,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
          font: {
            size: 12,
          },
          color: theme.palette.text.primary,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };
  
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  const handleStartTour = () => {
    startTour('dashboardTour');
  };
  
  const handleTourComplete = () => {
    markTourCompleted('dashboardTour');
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('dashboard.welcome', { name: user?.name || '' })}
          <Button
            variant="outlined"
            size="small"
            startIcon={<SchoolIcon />}
            onClick={handleStartTour}
            sx={{ ml: 2 }}
          >
            Take a Tour
          </Button>
        </Typography>
        
        <HelpButton variant="icon" currentPage="dashboard" />
      </Box>
      
      {/* Statistics Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          {t('dashboard.stats')}
          <HelpTooltip contentSection={helpContent.dashboard.stats} />
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Card 
            elevation={0}
            sx={{ 
              flex: '1 1 300px',
              minWidth: '250px',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleAltIcon />
                </Avatar>
                <Typography variant="h6">{t('dashboard.employeeCount')}</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 0 }}>{employeeCount}</Typography>
            </CardContent>
            <CardActions>
              <Button size="small">{t('common.viewAll')}</Button>
            </CardActions>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              flex: '1 1 300px',
              minWidth: '250px',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                  <BusinessIcon />
                </Avatar>
                <Typography variant="h6">{t('dashboard.departmentCount')}</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 0 }}>{departmentCount}</Typography>
            </CardContent>
            <CardActions>
              <Button size="small">{t('common.viewAll')}</Button>
            </CardActions>
          </Card>
          
          <Card 
            elevation={0}
            sx={{ 
              flex: '1 1 300px',
              minWidth: '250px',
              borderRadius: 2,
              border: 1,
              borderColor: 'divider',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                boxShadow: theme.shadows[4],
                transform: 'translateY(-4px)',
              },
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <WorkIcon />
                </Avatar>
                <Typography variant="h6">{t('dashboard.positionCount')}</Typography>
              </Box>
              <Typography variant="h3" sx={{ mb: 0 }}>{positionCount}</Typography>
            </CardContent>
            <CardActions>
              <Button size="small">{t('common.viewAll')}</Button>
            </CardActions>
          </Card>
        </Box>
      </Box>
      
      {/* Charts and Quick Actions Row */}
      <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: 400,
            flex: '1 1 700px',
            minWidth: '300px',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              {t('dashboard.departmentDistribution')}
              <HelpTooltip contentSection={helpContent.dashboard.chart} />
            </Typography>
          </Box>
          <Box sx={{ height: 300 }}>
            <Pie data={chartData} options={chartOptions} />
          </Box>
        </Paper>
        
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            height: 400,
            flex: '1 1 300px',
            minWidth: '250px',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" gutterBottom>{t('dashboard.quickActions')}</Typography>
          <Divider sx={{ mb: 2 }} />
          
          <Stack spacing={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonAddIcon />}
            >
              {t('dashboard.addEmployee')}
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<GroupAddIcon />}
            >
              {t('dashboard.addDepartment')}
            </Button>
            
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AssessmentIcon />}
            >
              {t('dashboard.generateReport')}
            </Button>
          </Stack>
        </Paper>
      </Box>
      
      {/* Recent Hires */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3,
          borderRadius: 2,
          border: 1,
          borderColor: 'divider',
          mb: 4
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
            {t('dashboard.recentHires')}
            <HelpTooltip contentSection={helpContent.dashboard.recentHires} />
          </Typography>
          <IconButton size="small">
            <MoreHorizIcon />
          </IconButton>
        </Box>
        
        <List sx={{ width: '100%' }}>
          {recentHires.map((employee) => (
            <ListItem
              key={employee.id}
              secondaryAction={
                <MuiTooltip title="View Profile">
                  <IconButton edge="end">
                    <MoreHorizIcon />
                  </IconButton>
                </MuiTooltip>
              }
              sx={{ 
                py: 1,
                '&:not(:last-child)': { 
                  borderBottom: 1, 
                  borderColor: 'divider' 
                }
              }}
            >
              <ListItemAvatar>
                <Avatar>{employee.name.charAt(0)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={employee.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {employee.position}
                    </Typography>
                    {` — ${employee.department} • Hired: ${formatDate(employee.hireDate)}`}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      {/* Guided Tour Dialog */}
      {currentTour && (
        <GuidedTour
          open={showTour}
          onClose={() => setShowTour(false)}
          onComplete={handleTourComplete}
          steps={currentTour.steps}
          tourName={currentTour.name}
        />
      )}
    </Box>
  );
};

export default Dashboard;