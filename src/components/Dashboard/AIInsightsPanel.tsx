import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  Alert,
  Button,
  Collapse,
  Tooltip
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { styled } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GroupsIcon from '@mui/icons-material/Groups';
import PsychologyIcon from '@mui/icons-material/Psychology';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import RecommendIcon from '@mui/icons-material/Recommend';
import SchoolIcon from '@mui/icons-material/School';
import HelpTooltip from '../common/HelpTooltip';

import { EmployeeInsights, getAIInsights } from '../../services/aiAnalyticsService';
import { formatEmployeeName } from '../../services/employeeService';
import { Employee } from '../../types/Employee';

// Styled components
const InsightCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'visible'
}));

const InsightTitle = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  fontWeight: 600,
  marginBottom: theme.spacing(1)
}));

const AIBadge = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: -10,
  right: 20,
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  fontSize: '0.7rem'
}));

interface AIInsightsPanelProps {
  showHelp?: boolean;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ showHelp = false }) => {
  const { t } = useTranslation();
  const [insights, setInsights] = useState<EmployeeInsights | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    turnover: true,
    performance: false,
    salary: false,
    team: false,
    skills: false
  });

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        const data = await getAIInsights();
        setInsights(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data for analysis:', err);
        setError(t('dashboard.aiInsights.loadError', 'Failed to load AI insights'));
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [t]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!insights) {
    return (
      <Alert severity="info">
        {t('dashboard.aiInsights.noData', 'No AI insights available')}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <PsychologyIcon sx={{ mr: 1 }} /> {t('dashboard.aiInsights.title', 'AI-Powered Insights')}
          {showHelp && (
            <HelpTooltip 
              helpKey="dashboard.aiInsights"
              title={t('help.dashboard.aiInsights.title', 'AI-Powered Insights')}
              content={t(
                'help.dashboard.aiInsights.content', 
                'Machine learning algorithms analyze your employee data to provide actionable insights about turnover risk, performance patterns, and organizational health.'
              )}
            />
          )}
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
        {/* Turnover Risk Card */}
        <InsightCard>
          <AIBadge label="AI" size="small" />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <InsightTitle variant="h6">
                <WarningAmberIcon color="warning" />
                {t('dashboard.aiInsights.turnoverRisk.title', 'Turnover Risk Analysis')}
              </InsightTitle>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => toggleSection('turnover')}
                endIcon={expandedSections.turnover ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {expandedSections.turnover ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="error" fontWeight="bold">
                  {insights.turnoverRisk.highRiskCount}
                </Typography>
                <Typography variant="body2">
                  {t('dashboard.aiInsights.turnoverRisk.high', 'High Risk')}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="warning.main" fontWeight="bold">
                  {insights.turnoverRisk.mediumRiskCount}
                </Typography>
                <Typography variant="body2">
                  {t('dashboard.aiInsights.turnoverRisk.medium', 'Medium Risk')}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {insights.turnoverRisk.lowRiskCount}
                </Typography>
                <Typography variant="body2">
                  {t('dashboard.aiInsights.turnoverRisk.low', 'Low Risk')}
                </Typography>
              </Box>
            </Box>
            
            <Collapse in={expandedSections.turnover}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                {t('dashboard.aiInsights.turnoverRisk.highRiskEmployees', 'High Risk Employees:')}
              </Typography>
              <List dense>
                {insights.turnoverRisk.highRiskEmployees.slice(0, 3).map((employee) => (
                  <ListItem key={employee.id}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <WarningAmberIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={formatEmployeeName(employee)} 
                      secondary={employee.position_title || '-'}
                    />
                  </ListItem>
                ))}
                {insights.turnoverRisk.highRiskEmployees.length === 0 && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {t('dashboard.aiInsights.turnoverRisk.noHighRisk', 'No high-risk employees detected')}
                  </Typography>
                )}
              </List>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                  {t(
                    'dashboard.aiInsights.turnoverRisk.tip',
                    'Tip: Consider scheduling check-ins with high-risk employees to address concerns and improve retention.'
                  )}
                </Alert>
              </Box>
            </Collapse>
          </CardContent>
        </InsightCard>

        {/* Performance Clusters Card */}
        <InsightCard>
          <AIBadge label="AI" size="small" />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <InsightTitle variant="h6">
                <TrendingUpIcon color="primary" />
                {t('dashboard.aiInsights.performance.title', 'Performance Clusters')}
              </InsightTitle>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => toggleSection('performance')}
                endIcon={expandedSections.performance ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {expandedSections.performance ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
              </Button>
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
              {insights.performanceClusters.clusterNames.map((name, index) => (
                <Tooltip key={name} title={`${insights.performanceClusters.clusterCounts[index]} ${t('employees.employees')}`}>
                  <Chip 
                    label={`${name} (${insights.performanceClusters.clusterCounts[index]})`} 
                    color={index === 0 ? 'success' : index === 1 ? 'primary' : 'default'}
                    sx={{ flex: 1 }}
                  />
                </Tooltip>
              ))}
            </Stack>
            
            <Collapse in={expandedSections.performance}>
              <Divider sx={{ my: 2 }} />
              {insights.performanceClusters.clusterNames.length > 0 ? (
                <>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {t('dashboard.aiInsights.performance.topPerformers', 'Top Performers:')}
                  </Typography>
                  <List dense>
                    {(insights.performanceClusters.clusterEmployees[insights.performanceClusters.clusterNames[0]] || [])
                      .slice(0, 3)
                      .map((employee) => (
                        <ListItem key={employee.id}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <TrendingUpIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={formatEmployeeName(employee)} 
                            secondary={employee.position_title || '-'}
                          />
                        </ListItem>
                      ))}
                  </List>
                </>
              ) : (
                <Typography variant="body2" sx={{ my: 1, fontStyle: 'italic' }}>
                  {t('dashboard.aiInsights.performance.noData', 'Not enough data to cluster employees by performance')}
                </Typography>
              )}
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                  {t(
                    'dashboard.aiInsights.performance.tip',
                    'Tip: Performance clusters help identify mentoring relationships between high performers and developing talent.'
                  )}
                </Alert>
              </Box>
            </Collapse>
          </CardContent>
        </InsightCard>

        {/* Salary Outliers Card */}
        <InsightCard>
          <AIBadge label="AI" size="small" />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <InsightTitle variant="h6">
                <TrendingDownIcon color="secondary" />
                {t('dashboard.aiInsights.salary.title', 'Salary Analysis')}
              </InsightTitle>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => toggleSection('salary')}
                endIcon={expandedSections.salary ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {expandedSections.salary ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', my: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="success.main" fontWeight="bold">
                  {insights.salaryOutliers.overperforming.length}
                </Typography>
                <Typography variant="body2">
                  {t('dashboard.aiInsights.salary.overperforming', 'Overperforming')}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="error" fontWeight="bold">
                  {insights.salaryOutliers.underperforming.length}
                </Typography>
                <Typography variant="body2">
                  {t('dashboard.aiInsights.salary.underperforming', 'Underperforming')}
                </Typography>
              </Box>
            </Box>
            
            <Collapse in={expandedSections.salary}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                {t('dashboard.aiInsights.salary.potentialIssues', 'Potential Salary Misalignments:')}
              </Typography>
              <List dense>
                {insights.salaryOutliers.underperforming.slice(0, 3).map((employee) => (
                  <ListItem key={employee.id}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <TrendingDownIcon color="error" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={formatEmployeeName(employee)} 
                      secondary={t('dashboard.aiInsights.salary.belowExpected', 'Salary below expected range')}
                    />
                  </ListItem>
                ))}
                {insights.salaryOutliers.underperforming.length === 0 && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {t('dashboard.aiInsights.salary.noIssues', 'No salary misalignments detected')}
                  </Typography>
                )}
              </List>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                  {t(
                    'dashboard.aiInsights.salary.tip',
                    'Tip: Regular salary reviews can help address misalignments before they impact employee retention.'
                  )}
                </Alert>
              </Box>
            </Collapse>
          </CardContent>
        </InsightCard>

        {/* Team Structure Card */}
        <InsightCard>
          <AIBadge label="AI" size="small" />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <InsightTitle variant="h6">
                <GroupsIcon color="info" />
                {t('dashboard.aiInsights.team.title', 'Team Structure Analysis')}
              </InsightTitle>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => toggleSection('team')}
                endIcon={expandedSections.team ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {expandedSections.team ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', my: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color="primary" fontWeight="bold">
                  {insights.teamStructure.optimalTeamSize}
                </Typography>
                <Typography variant="body2">
                  {t('dashboard.aiInsights.team.optimalSize', 'Optimal Team Size')}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" color={insights.teamStructure.unbalancedDepartments.length > 0 ? "warning.main" : "success.main"} fontWeight="bold">
                  {insights.teamStructure.unbalancedDepartments.length}
                </Typography>
                <Typography variant="body2">
                  {t('dashboard.aiInsights.team.unbalancedTeams', 'Unbalanced Teams')}
                </Typography>
              </Box>
            </Box>
            
            <Collapse in={expandedSections.team}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" fontWeight="bold">
                {t('dashboard.aiInsights.team.unbalancedDepartments', 'Departments That Need Restructuring:')}
              </Typography>
              <List dense>
                {insights.teamStructure.unbalancedDepartments.slice(0, 3).map((department) => (
                  <ListItem key={department.id}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <PeopleAltIcon color="warning" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={department.name} 
                    />
                  </ListItem>
                ))}
                {insights.teamStructure.unbalancedDepartments.length === 0 && (
                  <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                    {t('dashboard.aiInsights.team.noIssues', 'All teams are well-balanced')}
                  </Typography>
                )}
              </List>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                  {t(
                    'dashboard.aiInsights.team.tip',
                    'Tip: Teams of 5-9 people typically show optimal communication and productivity.'
                  )}
                </Alert>
              </Box>
            </Collapse>
          </CardContent>
        </InsightCard>

        {/* Skill Gaps Card */}
        <InsightCard sx={{ gridColumn: { md: '1 / -1' }}}>
          <AIBadge label="AI" size="small" />
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <InsightTitle variant="h6">
                <SchoolIcon color="primary" />
                {t('dashboard.aiInsights.skills.title', 'Skill Gap Analysis')}
              </InsightTitle>
              <Button 
                variant="text" 
                size="small" 
                onClick={() => toggleSection('skills')}
                endIcon={expandedSections.skills ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              >
                {expandedSections.skills ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
              </Button>
            </Box>
            
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, my: 2 }}>
              {insights.skillGaps.map((skill) => (
                <Chip 
                  key={skill} 
                  label={skill} 
                  color="primary"
                  variant="outlined"
                  icon={<RecommendIcon />}
                />
              ))}
            </Stack>
            
            <Collapse in={expandedSections.skills}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2">
                {t(
                  'dashboard.aiInsights.skills.analysis', 
                  'AI analysis suggests your organization may benefit from developing these skill sets to stay competitive in the industry.'
                )}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                  {t(
                    'dashboard.aiInsights.skills.tip',
                    'Tip: Consider implementing training programs or strategic hiring to address identified skill gaps.'
                  )}
                </Alert>
              </Box>
            </Collapse>
          </CardContent>
        </InsightCard>
      </Box>
    </Box>
  );
};

export default AIInsightsPanel;