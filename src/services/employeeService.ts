/**
 * Employee Service for the Employee Management System
 */

import { Employee } from '../types/Employee';

export interface EmployeeResult {
  success: boolean;
  employee?: Employee;
  message?: string;
}

export interface EmployeesResult {
  success: boolean;
  employees?: Employee[];
  message?: string;
}

/**
 * Get all employees
 */
export const getAllEmployees = async (): Promise<EmployeesResult> => {
  try {
    return await window.electronAPI.getAllEmployees();
  } catch (error) {
    console.error('Error fetching employees:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while fetching employees'
    };
  }
};

/**
 * Get an employee by ID
 */
export const getEmployeeById = async (id: number): Promise<EmployeeResult> => {
  try {
    return await window.electronAPI.getEmployeeById(id);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while fetching the employee'
    };
  }
};

/**
 * Create a new employee
 */
export const createEmployee = async (employee: Partial<Employee>): Promise<EmployeeResult> => {
  try {
    return await window.electronAPI.createEmployee(employee);
  } catch (error) {
    console.error('Error creating employee:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while creating the employee'
    };
  }
};

/**
 * Update an existing employee
 */
export const updateEmployee = async (employee: Partial<Employee> & { id: number }): Promise<EmployeeResult> => {
  try {
    return await window.electronAPI.updateEmployee(employee);
  } catch (error) {
    console.error('Error updating employee:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while updating the employee'
    };
  }
};

/**
 * Delete an employee
 */
export const deleteEmployee = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    return await window.electronAPI.deleteEmployee(id);
  } catch (error) {
    console.error('Error deleting employee:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the employee'
    };
  }
};

/**
 * Format employee name
 */
export const formatEmployeeName = (employee: Employee): string => {
  return `${employee.first_name} ${employee.last_name}`;
};

/**
 * Format employee salary
 */
export const formatSalary = (salary?: number): string => {
  if (!salary) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(salary);
};

/**
 * Calculate employee tenure in years and months
 */
export const calculateTenure = (hireDate: number): string => {
  const hire = new Date(hireDate);
  const now = new Date();
  
  const years = now.getFullYear() - hire.getFullYear();
  const months = now.getMonth() - hire.getMonth();
  
  if (months < 0) {
    return `${years - 1} years, ${months + 12} months`;
  }
  
  return `${years} years, ${months} months`;
};
