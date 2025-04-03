import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TourStep } from '../components/common/GuidedTour';
import { useHelpContent } from '../components/common/HelpContent';

interface HelpContextType {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  showTour: boolean;
  setShowTour: (show: boolean) => void;
  completedTours: string[];
  markTourCompleted: (tourName: string) => void;
  currentTour: {
    name: string;
    steps: TourStep[];
  } | null;
  startTour: (tourName: string) => void;
  isFirstVisit: (pageKey: string) => boolean;
  markPageVisited: (pageKey: string) => void;
}

const HelpContext = createContext<HelpContextType | null>(null);

interface HelpProviderProps {
  children: ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const helpContent = useHelpContent();
  
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [showTour, setShowTour] = useState<boolean>(false);
  const [completedTours, setCompletedTours] = useState<string[]>(() => {
    const saved = localStorage.getItem('completedTours');
    return saved ? JSON.parse(saved) : [];
  });
  const [visitedPages, setVisitedPages] = useState<string[]>(() => {
    const saved = localStorage.getItem('visitedPages');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentTour, setCurrentTour] = useState<{
    name: string;
    steps: TourStep[];
  } | null>(null);

  // Save completed tours to localStorage
  useEffect(() => {
    localStorage.setItem('completedTours', JSON.stringify(completedTours));
  }, [completedTours]);

  // Save visited pages to localStorage
  useEffect(() => {
    localStorage.setItem('visitedPages', JSON.stringify(visitedPages));
  }, [visitedPages]);

  const isFirstVisit = (pageKey: string): boolean => {
    return !visitedPages.includes(pageKey);
  };

  const markPageVisited = (pageKey: string): void => {
    if (!visitedPages.includes(pageKey)) {
      setVisitedPages((prev) => [...prev, pageKey]);
    }
  };

  const markTourCompleted = (tourName: string): void => {
    if (!completedTours.includes(tourName)) {
      setCompletedTours((prev) => [...prev, tourName]);
    }
  };

  const getDashboardTourSteps = (): TourStep[] => {
    return [
      {
        title: t('tours.dashboard.welcome.title', 'Welcome to the Dashboard'),
        content: t(
          'tours.dashboard.welcome.content',
          'This is your central command center where you can monitor and manage your entire organization.'
        ),
      },
      {
        title: t('tours.dashboard.statistics.title', 'Quick Statistics'),
        content: t(
          'tours.dashboard.statistics.content',
          'These cards show key metrics for your organization: total employees, departments, and positions.'
        ),
      },
      {
        title: t('tours.dashboard.charts.title', 'Department Distribution'),
        content: t(
          'tours.dashboard.charts.content',
          'This chart shows how your employees are distributed across different departments, giving you insight into your organizational structure.'
        ),
      },
      {
        title: t('tours.dashboard.recentHires.title', 'Recent Hires'),
        content: t(
          'tours.dashboard.recentHires.content',
          'Keep track of your newest team members in this section. It displays recently added employees with their positions and departments.'
        ),
      },
      {
        title: t('tours.dashboard.sidebar.title', 'Navigation Menu'),
        content: t(
          'tours.dashboard.sidebar.content',
          'Use this sidebar to navigate through different sections of the application. You can access employees, departments, positions, reports, and settings.'
        ),
      },
    ];
  };

  const getEmployeesTourSteps = (): TourStep[] => {
    return [
      {
        title: t('tours.employees.overview.title', 'Employee Management'),
        content: t(
          'tours.employees.overview.content',
          'This section allows you to manage all your employees. You can view, add, edit, and remove employees from your organization.'
        ),
      },
      {
        title: t('tours.employees.table.title', 'Employee List'),
        content: t(
          'tours.employees.table.content',
          'This table shows all your employees with basic information. You can sort and filter the list to find specific employees.'
        ),
      },
      {
        title: t('tours.employees.actions.title', 'Employee Actions'),
        content: t(
          'tours.employees.actions.content',
          'Use these buttons to take actions on employees. You can edit employee details, view their full profile, or remove them from the organization.'
        ),
      },
      {
        title: t('tours.employees.add.title', 'Adding Employees'),
        content: t(
          'tours.employees.add.content',
          'Click the "Add Employee" button to add a new employee to your organization. You\'ll need to provide their details and assign them to a department and position.'
        ),
      },
    ];
  };

  const getDepartmentsTourSteps = (): TourStep[] => {
    return [
      {
        title: t('tours.departments.overview.title', 'Department Management'),
        content: t(
          'tours.departments.overview.content',
          'This section allows you to manage the departments in your organization. Departments are used to organize employees and positions.'
        ),
      },
      {
        title: t('tours.departments.list.title', 'Department List'),
        content: t(
          'tours.departments.list.content',
          'This list shows all departments in your organization. You can see how many employees and positions each department has.'
        ),
      },
      {
        title: t('tours.departments.add.title', 'Adding Departments'),
        content: t(
          'tours.departments.add.content',
          'Click the "Add Department" button to create a new department. You\'ll need to provide a name and optional description.'
        ),
      },
    ];
  };

  const getPositionsTourSteps = (): TourStep[] => {
    return [
      {
        title: t('tours.positions.overview.title', 'Position Management'),
        content: t(
          'tours.positions.overview.content',
          'This section allows you to manage job positions in your organization. Positions define roles within each department.'
        ),
      },
      {
        title: t('tours.positions.list.title', 'Position List'),
        content: t(
          'tours.positions.list.content',
          'This list shows all positions in your organization. You can see which department each position belongs to and how many employees hold each position.'
        ),
      },
      {
        title: t('tours.positions.add.title', 'Adding Positions'),
        content: t(
          'tours.positions.add.content',
          'Click the "Add Position" button to create a new position. You\'ll need to select a department and provide a title for the position.'
        ),
      },
    ];
  };

  const startTour = (tourName: string): void => {
    let steps: TourStep[] = [];
    let name = '';

    switch (tourName) {
      case 'dashboardTour':
        steps = getDashboardTourSteps();
        name = t('tours.dashboard.name', 'Dashboard Tour');
        break;
      case 'employeesTour':
        steps = getEmployeesTourSteps();
        name = t('tours.employees.name', 'Employees Tour');
        break;
      case 'departmentsTour':
        steps = getDepartmentsTourSteps();
        name = t('tours.departments.name', 'Departments Tour');
        break;
      case 'positionsTour':
        steps = getPositionsTourSteps();
        name = t('tours.positions.name', 'Positions Tour');
        break;
      default:
        return;
    }

    setCurrentTour({
      name,
      steps,
    });
    setShowTour(true);
  };

  return (
    <HelpContext.Provider
      value={{
        showHelp,
        setShowHelp,
        showTour,
        setShowTour,
        completedTours,
        markTourCompleted,
        currentTour,
        startTour,
        isFirstVisit,
        markPageVisited,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
};

export const useHelp = (): HelpContextType => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

export default HelpContext;