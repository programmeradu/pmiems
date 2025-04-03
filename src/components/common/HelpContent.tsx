import React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography, List, ListItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

// This file contains the content for all help tooltips
// Organizing this in one place makes it easier to maintain and translate

export interface HelpContentSection {
  key: string;
  title: string;
  content: string;
  steps?: string[];
  tips?: string[];
}

export const useHelpContent = () => {
  const { t } = useTranslation();

  // Dashboard help content
  const dashboard = {
    overview: {
      key: 'dashboard.overview',
      title: t('help.dashboard.overview.title', 'Dashboard Overview'),
      content: t(
        'help.dashboard.overview.content',
        'The dashboard gives you a quick overview of your organization with key metrics and recent activity.'
      ),
      tips: [
        t('help.dashboard.overview.tip1', 'Check this page regularly to stay updated on your organization.'),
        t('help.dashboard.overview.tip2', 'Hover over charts to see detailed information.')
      ]
    },
    stats: {
      key: 'dashboard.stats',
      title: t('help.dashboard.stats.title', 'Statistics Cards'),
      content: t(
        'help.dashboard.stats.content',
        'These cards show the total number of employees, departments, and positions in your organization.'
      ),
      tips: [
        t('help.dashboard.stats.tip1', 'Click "View All" to see the complete list.'),
        t('help.dashboard.stats.tip2', 'The numbers update automatically as you add or remove items.')
      ]
    },
    chart: {
      key: 'dashboard.chart',
      title: t('help.dashboard.chart.title', 'Department Distribution'),
      content: t(
        'help.dashboard.chart.content',
        'This chart visualizes how your employees are distributed across departments.'
      ),
      tips: [
        t('help.dashboard.chart.tip1', 'Hover over sections to see the exact employee count and percentage.'),
        t('help.dashboard.chart.tip2', 'A well-balanced organization typically has appropriate staffing across departments.')
      ]
    },
    recentHires: {
      key: 'dashboard.recentHires',
      title: t('help.dashboard.recentHires.title', 'Recent Hires'),
      content: t(
        'help.dashboard.recentHires.content',
        'This section shows your most recently added employees, helping you keep track of new team members.'
      ),
      tips: [
        t('help.dashboard.recentHires.tip1', 'Click on an employee to see their full profile.'),
        t('help.dashboard.recentHires.tip2', 'Use this to quickly check which departments are actively hiring.')
      ]
    }
  };

  // Employees help content
  const employees = {
    list: {
      key: 'employees.list',
      title: t('help.employees.list.title', 'Employee List'),
      content: t(
        'help.employees.list.content',
        'This page displays all employees in your organization. You can sort, filter, and manage employees from here.'
      ),
      steps: [
        t('help.employees.list.step1', 'Use the search box to find specific employees.'),
        t('help.employees.list.step2', 'Click the column headers to sort the list.'),
        t('help.employees.list.step3', 'Use the filter button to filter by department or position.')
      ]
    },
    add: {
      key: 'employees.add',
      title: t('help.employees.add.title', 'Adding Employees'),
      content: t(
        'help.employees.add.content',
        'Adding new employees is easy with our step-by-step form.'
      ),
      steps: [
        t('help.employees.add.step1', 'Click the "Add Employee" button.'),
        t('help.employees.add.step2', 'Fill out the required information.'),
        t('help.employees.add.step3', 'Select a department and position.'),
        t('help.employees.add.step4', 'Click "Save" to add the employee to your organization.')
      ]
    }
  };

  // Departments help content
  const departments = {
    list: {
      key: 'departments.list',
      title: t('help.departments.list.title', 'Department Management'),
      content: t(
        'help.departments.list.content',
        'Departments help you organize your company structure and group employees by function.'
      ),
      tips: [
        t('help.departments.list.tip1', 'Create departments before adding positions and employees.'),
        t('help.departments.list.tip2', 'Department names should be clear and descriptive.')
      ]
    }
  };

  // Positions help content
  const positions = {
    list: {
      key: 'positions.list',
      title: t('help.positions.list.title', 'Position Management'),
      content: t(
        'help.positions.list.content',
        'Positions define the roles within each department. You must create positions before assigning employees to them.'
      ),
      tips: [
        t('help.positions.list.tip1', 'Each position belongs to a specific department.'),
        t('help.positions.list.tip2', 'Create a variety of positions to reflect your organization structure.')
      ]
    }
  };

  // Reports help content
  const reports = {
    overview: {
      key: 'reports.overview',
      title: t('help.reports.overview.title', 'Reports Overview'),
      content: t(
        'help.reports.overview.content',
        'Reports provide insights into your workforce and organization structure. Generate reports to analyze data and make informed decisions.'
      ),
      steps: [
        t('help.reports.overview.step1', 'Select a report type from the dropdown.'),
        t('help.reports.overview.step2', 'Configure any filters or parameters.'),
        t('help.reports.overview.step3', 'Click "Generate Report" to view the results.'),
        t('help.reports.overview.step4', 'Use the export options to save reports in different formats.')
      ]
    }
  };

  // Settings help content
  const settings = {
    general: {
      key: 'settings.general',
      title: t('help.settings.general.title', 'General Settings'),
      content: t(
        'help.settings.general.content',
        'Configure your application preferences, including language, theme, and notification settings.'
      ),
      tips: [
        t('help.settings.general.tip1', 'Switch to dark mode for reduced eye strain in low-light environments.'),
        t('help.settings.general.tip2', 'Choose the language that works best for your team.')
      ]
    },
    account: {
      key: 'settings.account',
      title: t('help.settings.account.title', 'Account Settings'),
      content: t(
        'help.settings.account.content',
        'Manage your user account, including your profile information and security settings.'
      ),
      steps: [
        t('help.settings.account.step1', 'Update your profile information to keep it current.'),
        t('help.settings.account.step2', 'Change your password regularly for better security.'),
        t('help.settings.account.step3', 'Configure your notification preferences.')
      ]
    }
  };

  // Navigation help content
  const navigation = {
    sidebar: {
      key: 'navigation.sidebar',
      title: t('help.navigation.sidebar.title', 'Navigation Menu'),
      content: t(
        'help.navigation.sidebar.content',
        'The sidebar menu gives you quick access to all parts of the application.'
      ),
      tips: [
        t('help.navigation.sidebar.tip1', 'Click on any menu item to navigate to that section.'),
        t('help.navigation.sidebar.tip2', 'You can collapse the sidebar on smaller screens by clicking the menu icon.')
      ]
    }
  };

  return {
    dashboard,
    employees,
    departments,
    positions,
    reports,
    settings,
    navigation
  };
};

interface StepsProps {
  steps?: string[];
}

export const Steps: React.FC<StepsProps> = ({ steps }) => {
  if (!steps || steps.length === 0) return null;
  
  return (
    <List dense disablePadding sx={{ mt: 1 }}>
      {steps.map((step, index) => (
        <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <KeyboardArrowRightIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <ListItemText 
            primary={
              <Typography variant="body2">
                {step}
              </Typography>
            } 
          />
        </ListItem>
      ))}
    </List>
  );
};

interface TipsProps {
  tips?: string[];
}

export const Tips: React.FC<TipsProps> = ({ tips }) => {
  if (!tips || tips.length === 0) return null;
  
  return (
    <Box sx={{ mt: 1.5 }}>
      <Typography variant="subtitle2" color="primary.main" gutterBottom>
        Tips:
      </Typography>
      <List dense disablePadding>
        {tips.map((tip, index) => (
          <ListItem key={index} disablePadding sx={{ py: 0.5 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>
              <CheckCircleOutlineIcon color="success" fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={
                <Typography variant="body2">
                  {tip}
                </Typography>
              } 
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

interface HelpContentProps {
  section: HelpContentSection;
}

export const HelpContent: React.FC<HelpContentProps> = ({ section }) => {
  return (
    <>
      <Typography variant="body2" color="text.secondary" paragraph>
        {section.content}
      </Typography>
      
      <Steps steps={section.steps} />
      <Tips tips={section.tips} />
    </>
  );
};