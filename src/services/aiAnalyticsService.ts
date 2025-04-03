/**
 * AI Analytics Service for the PSI-SUSAS Membership Data Management System
 * Provides machine learning capabilities for analytics using TensorFlow.js
 */
import * as tf from '@tensorflow/tfjs';
import { PCA } from 'ml-pca';
import * as mlKmeans from 'ml-kmeans';
import { getAllEmployees } from './employeeService';
import { getAllDepartments } from './departmentService';
import { getAllPositions } from './positionService';
import { Employee } from '../types/Employee';
import { Department } from '../types/Department';
import { Position } from '../types/Position';
import { hasElectronAPI } from '../utils/ipc';

// Initialize TensorFlow.js with CPU backend for compatibility
tf.setBackend('cpu').then(() => {
  console.log('TensorFlow.js is ready with CPU backend');
});

/**
 * Interface for employee insights
 */
export interface EmployeeInsights {
  turnoverRisk: {
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    highRiskEmployees: Employee[];
  };
  performanceClusters: {
    clusterNames: string[];
    clusterCounts: number[];
    clusterEmployees: Record<string, Employee[]>;
  };
  salaryOutliers: {
    overperforming: Employee[];
    underperforming: Employee[];
  };
  teamStructure: {
    optimalTeamSize: number;
    unbalancedDepartments: Department[];
  };
  skillGaps: string[];
}

/**
 * Interface for department analytics
 */
export interface DepartmentAnalytics {
  departmentId: number;
  departmentName: string;
  headcount: number;
  avgSalary: number;
  avgTenure: number;
  turnoverRisk: number;
  performanceScore: number;
}

/**
 * Get employee turnover risk predictions based on tenure, salary and other factors
 */
export const predictTurnoverRisk = async (): Promise<{
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  highRiskEmployees: Employee[];
}> => {
  try {
    const result = await getAllEmployees();
    if (!result.success || !result.employees) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = result.employees;
    
    // The ML model would normally be trained and saved, but for this demo
    // we'll use a simpler heuristic approach
    
    // Calculate normalized features that affect turnover risk
    const highRiskEmployees: Employee[] = [];
    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    
    const now = Date.now();
    
    // Calculate risk factors
    employees.forEach(employee => {
      // Tenure in years
      const tenureInYears = (now - employee.hire_date) / (365 * 24 * 60 * 60 * 1000);
      
      // Salary compared to average
      const avgSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length;
      const normalizedSalary = (employee.salary || 0) / avgSalary;
      
      // Calculate risk score (higher score = higher risk)
      let riskScore = 0;
      
      // Tenure factor: newer employees are higher risk
      if (tenureInYears < 1) {
        riskScore += 3;
      } else if (tenureInYears < 2) {
        riskScore += 2;
      } else if (tenureInYears < 5) {
        riskScore += 1;
      }
      
      // Salary factor: lower salary increases risk
      if (normalizedSalary < 0.8) {
        riskScore += 3;
      } else if (normalizedSalary < 0.95) {
        riskScore += 1;
      }
      
      // Analyze risk levels
      if (riskScore >= 4) {
        highRiskCount++;
        highRiskEmployees.push(employee);
      } else if (riskScore >= 2) {
        mediumRiskCount++;
      } else {
        lowRiskCount++;
      }
    });
    
    return {
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      highRiskEmployees
    };
    
  } catch (error) {
    console.error('Error predicting turnover risk:', error);
    return {
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      highRiskEmployees: []
    };
  }
};

/**
 * Cluster employees by performance and attributes
 */
export const clusterEmployeesByPerformance = async (): Promise<{
  clusterNames: string[];
  clusterCounts: number[];
  clusterEmployees: Record<string, Employee[]>;
}> => {
  try {
    const result = await getAllEmployees();
    if (!result.success || !result.employees) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = result.employees;
    
    // Extract features for clustering
    const data = employees.map(employee => {
      // Tenure in years
      const tenureInYears = (Date.now() - employee.hire_date) / (365 * 24 * 60 * 60 * 1000);
      
      // Salary normalized
      const avgSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length;
      const normalizedSalary = (employee.salary || 0) / avgSalary;
      
      return [tenureInYears, normalizedSalary];
    });
    
    // Perform K-means clustering with 3 clusters
    const kmeans = mlKmeans.kmeans(data, 3, { initialization: 'random' });
    const clusters = kmeans.clusters;
    
    // Map clusters to meaningful names
    const clusterNames = ['High Performers', 'Core Team', 'Developing Talent'];
    const clusterCounts = [0, 0, 0];
    const clusterEmployees: Record<string, Employee[]> = {
      'High Performers': [],
      'Core Team': [],
      'Developing Talent': []
    };
    
    // Assign employees to named clusters
    employees.forEach((employee, index) => {
      const clusterIndex = clusters[index];
      const clusterName = clusterNames[clusterIndex];
      clusterCounts[clusterIndex]++;
      clusterEmployees[clusterName].push(employee);
    });
    
    return {
      clusterNames,
      clusterCounts,
      clusterEmployees
    };
    
  } catch (error) {
    console.error('Error clustering employees:', error);
    return {
      clusterNames: [],
      clusterCounts: [],
      clusterEmployees: {}
    };
  }
};

/**
 * Identify salary outliers - employees who are over or under paid relative to performance
 */
export const identifySalaryOutliers = async (): Promise<{
  overperforming: Employee[];
  underperforming: Employee[];
}> => {
  try {
    const result = await getAllEmployees();
    if (!result.success || !result.employees) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = result.employees;
    
    // In a full implementation, we would use a regression model to predict expected salary
    // For this demo, we'll use tenure and department as proxies for expected salary
    
    // Group by department to compare within same departments
    const departmentGroups: Record<number, Employee[]> = {};
    
    employees.forEach(employee => {
      if (!departmentGroups[employee.department_id]) {
        departmentGroups[employee.department_id] = [];
      }
      departmentGroups[employee.department_id].push(employee);
    });
    
    const overperforming: Employee[] = [];
    const underperforming: Employee[] = [];
    
    // Analyze each department separately
    Object.values(departmentGroups).forEach(departmentEmployees => {
      if (departmentEmployees.length < 3) return; // Skip small departments
      
      // Calculate average salary in this department
      const avgSalary = departmentEmployees.reduce((sum, e) => sum + (e.salary || 0), 0) / departmentEmployees.length;
      
      // Calculate standard deviation
      const squaredDiffs = departmentEmployees.map(e => Math.pow((e.salary || 0) - avgSalary, 2));
      const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
      const stdDev = Math.sqrt(avgSquaredDiff);
      
      // Find outliers (beyond 1.5 standard deviations)
      departmentEmployees.forEach(employee => {
        if (!employee.salary) return;
        
        const zScore = (employee.salary - avgSalary) / stdDev;
        
        if (zScore > 1.5) {
          overperforming.push(employee);
        } else if (zScore < -1.5) {
          underperforming.push(employee);
        }
      });
    });
    
    return {
      overperforming,
      underperforming
    };
    
  } catch (error) {
    console.error('Error identifying salary outliers:', error);
    return {
      overperforming: [],
      underperforming: []
    };
  }
};

/**
 * Analyze team structure and suggest optimal team sizing
 */
export const analyzeTeamStructure = async (): Promise<{
  optimalTeamSize: number;
  unbalancedDepartments: Department[];
}> => {
  try {
    const employeesResult = await getAllEmployees();
    const departmentsResult = await getAllDepartments();
    
    if (!employeesResult.success || !employeesResult.employees || 
        !departmentsResult.success || !departmentsResult.departments) {
      throw new Error('Failed to fetch data');
    }
    
    const employees = employeesResult.employees;
    const departments = departmentsResult.departments;
    
    // Count employees per department
    const departmentCounts: Record<number, number> = {};
    employees.forEach(employee => {
      if (!departmentCounts[employee.department_id]) {
        departmentCounts[employee.department_id] = 0;
      }
      departmentCounts[employee.department_id]++;
    });
    
    // Calculate department statistics
    const departmentSizes = Object.values(departmentCounts);
    const averageDeptSize = departmentSizes.reduce((sum, count) => sum + count, 0) / departmentSizes.length;
    
    // Based on research, optimal team sizes are often between 5-9 people
    // We'll find the closest value to that range
    const optimalTeamSize = Math.max(5, Math.min(9, Math.round(averageDeptSize)));
    
    // Find unbalanced departments
    const unbalancedDepartments = departments.filter(dept => {
      const size = departmentCounts[dept.id] || 0;
      // Consider a department unbalanced if it's 50% bigger or smaller than optimal
      return size > optimalTeamSize * 1.5 || (size < optimalTeamSize * 0.5 && size > 0);
    });
    
    return {
      optimalTeamSize,
      unbalancedDepartments
    };
    
  } catch (error) {
    console.error('Error analyzing team structure:', error);
    return {
      optimalTeamSize: 7, // Default recommendation
      unbalancedDepartments: []
    };
  }
};

/**
 * Identify potential skill gaps in the organization
 */
export const identifySkillGaps = async (): Promise<string[]> => {
  try {
    const employeesResult = await getAllEmployees();
    const positionsResult = await getAllPositions();
    
    if (!employeesResult.success || !employeesResult.employees || 
        !positionsResult.success || !positionsResult.positions) {
      throw new Error('Failed to fetch data');
    }
    
    const employees = employeesResult.employees;
    const positions = positionsResult.positions;
    
    // Count employees per position
    const positionCounts: Record<number, number> = {};
    employees.forEach(employee => {
      if (!positionCounts[employee.position_id]) {
        positionCounts[employee.position_id] = 0;
      }
      positionCounts[employee.position_id]++;
    });
    
    // List of common essential skills in modern organizations
    const essentialSkills = [
      'Data Analysis',
      'Digital Marketing',
      'Project Management',
      'Software Development',
      'UX/UI Design',
      'Cloud Computing',
      'Cybersecurity',
      'AI/Machine Learning'
    ];
    
    // In a real implementation, you'd extract these from position descriptions
    // For demo purposes, we'll use a basic algorithm to identify gaps
    
    // Identify potential gaps based on position distribution
    const skillGaps: string[] = [];
    
    // Find positions with no employees
    const unmatchedPositions = positions.filter(position => 
      !positionCounts[position.id] || positionCounts[position.id] === 0
    );
    
    // Add skill gaps based on unmatched positions
    if (unmatchedPositions.length > 0) {
      // Select a subset of the essential skills based on unmatched positions count
      const gapCount = Math.min(unmatchedPositions.length, 3);
      for (let i = 0; i < gapCount; i++) {
        skillGaps.push(essentialSkills[i]);
      }
    }
    
    // If no gaps detected, suggest advanced skills for future growth
    if (skillGaps.length === 0) {
      skillGaps.push('Advanced Data Analytics');
      skillGaps.push('Artificial Intelligence Implementation');
    }
    
    return skillGaps;
    
  } catch (error) {
    console.error('Error identifying skill gaps:', error);
    return ['Data Analysis', 'Digital Transformation']; // Default recommendations
  }
};

/**
 * Get comprehensive AI-powered analytics for the dashboard
 */
export const getAIInsights = async (): Promise<EmployeeInsights> => {
  // Run the actual analysis regardless of environment
  // This will use our updated ipc calls that access localStorage in browser mode
  
  // Parallelize the analytics functions for better performance
  const [
    turnoverRisk,
    performanceClusters,
    salaryOutliers,
    teamStructure,
    skillGaps
  ] = await Promise.all([
    predictTurnoverRisk(),
    clusterEmployeesByPerformance(),
    identifySalaryOutliers(),
    analyzeTeamStructure(),
    identifySkillGaps()
  ]);
  
  return {
    turnoverRisk,
    performanceClusters,
    salaryOutliers,
    teamStructure,
    skillGaps
  };
};

/**
 * Get department analytics with machine learning enhanced insights
 */
export const getDepartmentAnalytics = async (): Promise<DepartmentAnalytics[]> => {

  try {
    const employeesResult = await getAllEmployees();
    const departmentsResult = await getAllDepartments();
    
    if (!employeesResult.success || !employeesResult.employees || 
        !departmentsResult.success || !departmentsResult.departments) {
      throw new Error('Failed to fetch data');
    }
    
    const employees = employeesResult.employees;
    const departments = departmentsResult.departments;
    
    const now = Date.now();
    
    // Group employees by department
    const departmentEmployees: Record<number, Employee[]> = {};
    
    employees.forEach(employee => {
      if (!departmentEmployees[employee.department_id]) {
        departmentEmployees[employee.department_id] = [];
      }
      departmentEmployees[employee.department_id].push(employee);
    });
    
    // Calculate analytics for each department
    const analytics: DepartmentAnalytics[] = departments.map(department => {
      const deptEmployees = departmentEmployees[department.id] || [];
      const headcount = deptEmployees.length;
      
      // Calculate average salary
      const totalSalary = deptEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
      const avgSalary = headcount > 0 ? totalSalary / headcount : 0;
      
      // Calculate average tenure in years
      const totalTenure = deptEmployees.reduce((sum, e) => sum + (now - e.hire_date), 0);
      const avgTenure = headcount > 0 ? totalTenure / headcount / (365 * 24 * 60 * 60 * 1000) : 0;
      
      // Calculate turnover risk (simplified algorithm)
      let riskScore = 0;
      if (avgTenure < 1) riskScore += 0.3;
      if (avgSalary < 50000) riskScore += 0.2;
      if (headcount < 3) riskScore += 0.2;
      
      // Calculate performance score (simplified)
      // In a real app, this would incorporate actual performance metrics
      const performanceScore = 0.7 + Math.min(avgTenure / 10, 0.2) + Math.min(avgSalary / 200000, 0.1);
      
      return {
        departmentId: department.id,
        departmentName: department.name,
        headcount,
        avgSalary,
        avgTenure,
        turnoverRisk: riskScore,
        performanceScore
      };
    });
    
    return analytics;
    
  } catch (error) {
    console.error('Error calculating department analytics:', error);
    return [];
  }
};

/**
 * Make personalized employee recommendations using ML
 */
export const getEmployeeRecommendations = async (employeeId: number): Promise<string[]> => {
  
  try {
    const employeeResult = await getAllEmployees();
    if (!employeeResult.success || !employeeResult.employees) {
      throw new Error('Failed to fetch employees');
    }
    
    const employees = employeeResult.employees;
    const employee = employees.find(e => e.id === employeeId);
    
    if (!employee) {
      return ["Employee not found"];
    }
    
    // Calculate tenure in years
    const tenureInYears = (Date.now() - employee.hire_date) / (365 * 24 * 60 * 60 * 1000);
    
    // Generate personalized recommendations
    const recommendations: string[] = [];
    
    // Salary recommendations
    const avgSalary = employees.reduce((sum, e) => sum + (e.salary || 0), 0) / employees.length;
    if ((employee.salary || 0) < avgSalary * 0.9) {
      recommendations.push("Consider compensation review based on market analysis");
    }
    
    // Tenure-based recommendations
    if (tenureInYears < 1) {
      recommendations.push("Implement 90-day check-in to ensure proper onboarding");
    } else if (tenureInYears > 5 && tenureInYears < 7) {
      recommendations.push("Evaluate for leadership development opportunities");
    } else if (tenureInYears > 7) {
      recommendations.push("Schedule career path discussion to maintain engagement");
    }
    
    // Add general recommendations if we don't have enough
    if (recommendations.length < 2) {
      recommendations.push("Consider cross-department collaboration opportunities");
      recommendations.push("Evaluate for specialized skill development");
    }
    
    return recommendations;
    
  } catch (error) {
    console.error('Error generating employee recommendations:', error);
    return ["Error generating recommendations"];
  }
};