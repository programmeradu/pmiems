/**
 * Analysis Utility Functions for the Employee Management System
 * This file contains utility functions for data analysis and visualization
 */

import { Employee, Department, Position } from '../types';
import { format, subMonths, compareAsc, differenceInMonths } from 'date-fns';

/**
 * Calculate average salary by department
 */
export const calculateAverageSalaryByDepartment = (
  employees: Employee[],
  departments: Department[]
): { departmentId: number; name: string; averageSalary: number }[] => {
  const departmentMap = new Map<number, { total: number; count: number; name: string }>();

  // Initialize with all departments (even empty ones)
  departments.forEach(dept => {
    departmentMap.set(dept.id, { total: 0, count: 0, name: dept.name });
  });

  // Calculate total and count for each department
  employees.forEach(employee => {
    if (employee.salary && employee.department_id) {
      const dept = departmentMap.get(employee.department_id);
      if (dept) {
        dept.total += employee.salary;
        dept.count += 1;
      }
    }
  });

  // Convert to final format
  return Array.from(departmentMap.entries())
    .map(([departmentId, { total, count, name }]) => ({
      departmentId,
      name,
      averageSalary: count > 0 ? total / count : 0,
    }))
    .sort((a, b) => b.averageSalary - a.averageSalary); // Sort by highest average salary
};

/**
 * Calculate headcount by department
 */
export const calculateHeadcountByDepartment = (
  employees: Employee[],
  departments: Department[]
): { departmentId: number; name: string; headcount: number }[] => {
  const departmentMap = new Map<number, { name: string; headcount: number }>();

  // Initialize with all departments (even empty ones)
  departments.forEach(dept => {
    departmentMap.set(dept.id, { name: dept.name, headcount: 0 });
  });

  // Count employees for each department
  employees.forEach(employee => {
    if (employee.department_id) {
      const dept = departmentMap.get(employee.department_id);
      if (dept) {
        dept.headcount += 1;
      }
    }
  });

  // Convert to final format
  return Array.from(departmentMap.entries())
    .map(([departmentId, { name, headcount }]) => ({
      departmentId,
      name,
      headcount,
    }))
    .sort((a, b) => b.headcount - a.headcount); // Sort by highest headcount
};

/**
 * Calculate headcount by position
 */
export const calculateHeadcountByPosition = (
  employees: Employee[],
  positions: Position[]
): { positionId: number; title: string; departmentName?: string; headcount: number }[] => {
  const positionMap = new Map<number, { title: string; departmentName?: string; headcount: number }>();

  // Initialize with all positions (even empty ones)
  positions.forEach(pos => {
    positionMap.set(pos.id, { 
      title: pos.title, 
      departmentName: pos.department_name,
      headcount: 0 
    });
  });

  // Count employees for each position
  employees.forEach(employee => {
    if (employee.position_id) {
      const position = positionMap.get(employee.position_id);
      if (position) {
        position.headcount += 1;
      }
    }
  });

  // Convert to final format
  return Array.from(positionMap.entries())
    .map(([positionId, { title, departmentName, headcount }]) => ({
      positionId,
      title,
      departmentName,
      headcount,
    }))
    .sort((a, b) => b.headcount - a.headcount); // Sort by highest headcount
};

/**
 * Calculate average employee tenure in years
 */
export const calculateAverageTenure = (employees: Employee[]): number => {
  if (employees.length === 0) return 0;
  
  const now = new Date();
  let totalMonths = 0;
  
  employees.forEach(employee => {
    const hireDate = new Date(employee.hire_date);
    totalMonths += differenceInMonths(now, hireDate);
  });
  
  // Convert months to years and round to 1 decimal place
  const averageYears = (totalMonths / employees.length) / 12;
  return Math.round(averageYears * 10) / 10;
};

/**
 * Calculate salary distribution in ranges
 */
export const calculateSalaryDistribution = (
  employees: Employee[]
): { range: string; count: number }[] => {
  // Define salary ranges
  const ranges = [
    { min: 0, max: 30000, label: '$0 - $30K' },
    { min: 30000, max: 50000, label: '$30K - $50K' },
    { min: 50000, max: 75000, label: '$50K - $75K' },
    { min: 75000, max: 100000, label: '$75K - $100K' },
    { min: 100000, max: 150000, label: '$100K - $150K' },
    { min: 150000, max: Number.MAX_SAFE_INTEGER, label: '$150K+' },
  ];

  // Initialize counts
  const distribution = ranges.map(range => ({ range: range.label, count: 0 }));

  // Count employees in each range
  employees.forEach(employee => {
    if (employee.salary !== null && employee.salary !== undefined) {
      const rangeIndex = ranges.findIndex(
        range => employee.salary! >= range.min && employee.salary! < range.max
      );
      if (rangeIndex !== -1) {
        distribution[rangeIndex].count += 1;
      }
    }
  });

  return distribution;
};

/**
 * Calculate employee growth over months
 */
export const calculateEmployeeGrowth = (
  employees: Employee[]
): { month: string; count: number }[] => {
  if (employees.length === 0) return [];

  // Get the date range (12 months)
  const now = new Date();
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(now, 11 - i);
    return {
      month: format(date, 'MMM yyyy'),
      date,
      count: 0,
    };
  });

  // Sort employees by hire date
  const sortedEmployees = [...employees].sort((a, b) => 
    compareAsc(new Date(a.hire_date), new Date(b.hire_date))
  );

  // Calculate cumulative headcount for each month
  let runningCount = 0;
  months.forEach((month, index) => {
    // Count employees hired before or during this month
    while (sortedEmployees.length > 0 && 
           compareAsc(new Date(sortedEmployees[0].hire_date), month.date) <= 0) {
      runningCount++;
      sortedEmployees.shift();
    }
    months[index].count = runningCount;
  });

  return months;
};