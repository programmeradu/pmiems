/**
 * Report Service for the Employee Management System
 */

import { Employee, Department, Position } from '../types';

export interface ReportOptions {
  type: 'employees' | 'departments' | 'positions';
  filters?: {
    departmentId?: number;
    positionId?: number;
    startDate?: number;
    endDate?: number;
  };
  fields: string[];
}

export interface ReportResult {
  success: boolean;
  data?: any[];
  columns?: { key: string; label: string }[];
  message?: string;
}

/**
 * Generate a report based on options
 */
export const generateReport = async (options: ReportOptions): Promise<ReportResult> => {
  try {
    let data: any[] = [];
    let columns: { key: string; label: string }[] = [];
    
    // Get data based on report type
    switch (options.type) {
      case 'employees':
        const employeesResult = await window.electronAPI.getAllEmployees();
        if (!employeesResult.success) {
          return {
            success: false,
            message: employeesResult.message || 'Failed to fetch employee data'
          };
        }
        
        data = employeesResult.employees || [];
        
        // Apply filters
        if (options.filters) {
          if (options.filters.departmentId) {
            data = data.filter(emp => emp.department_id === options.filters?.departmentId);
          }
          
          if (options.filters.positionId) {
            data = data.filter(emp => emp.position_id === options.filters?.positionId);
          }
          
          if (options.filters.startDate) {
            data = data.filter(emp => emp.hire_date >= options.filters!.startDate!);
          }
          
          if (options.filters.endDate) {
            data = data.filter(emp => emp.hire_date <= options.filters!.endDate!);
          }
        }
        
        columns = [
          { key: 'id', label: 'ID' },
          { key: 'first_name', label: 'First Name' },
          { key: 'last_name', label: 'Last Name' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Phone' },
          { key: 'position_title', label: 'Position' },
          { key: 'department_name', label: 'Department' },
          { key: 'hire_date', label: 'Hire Date' },
          { key: 'salary', label: 'Salary' }
        ];
        break;
        
      case 'departments':
        const departmentsResult = await window.electronAPI.getAllDepartments();
        if (!departmentsResult.success) {
          return {
            success: false,
            message: departmentsResult.message || 'Failed to fetch department data'
          };
        }
        
        data = departmentsResult.departments || [];
        columns = [
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
          { key: 'description', label: 'Description' },
          { key: 'created_at', label: 'Created At' }
        ];
        break;
        
      case 'positions':
        const positionsResult = await window.electronAPI.getAllPositions();
        if (!positionsResult.success) {
          return {
            success: false,
            message: positionsResult.message || 'Failed to fetch position data'
          };
        }
        
        data = positionsResult.positions || [];
        
        // Apply filters
        if (options.filters && options.filters.departmentId) {
          data = data.filter(pos => pos.department_id === options.filters?.departmentId);
        }
        
        columns = [
          { key: 'id', label: 'ID' },
          { key: 'title', label: 'Title' },
          { key: 'department_name', label: 'Department' },
          { key: 'description', label: 'Description' },
          { key: 'created_at', label: 'Created At' }
        ];
        break;
    }
    
    // Filter columns based on selected fields
    columns = columns.filter(col => options.fields.includes(col.key));
    
    return {
      success: true,
      data,
      columns
    };
  } catch (error) {
    console.error('Error generating report:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while generating the report'
    };
  }
};

/**
 * Export report data to CSV format
 */
export const exportToCSV = (data: any[], columns: { key: string; label: string }[], filename: string): string => {
  // Create CSV header row
  const header = columns.map(col => col.label).join(',');
  
  // Create CSV data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      
      // Handle special types
      if (value === null || value === undefined) {
        return '';
      }
      
      if (col.key === 'hire_date' || col.key === 'created_at' || col.key === 'updated_at') {
        return new Date(value).toLocaleDateString();
      }
      
      if (col.key === 'salary' && value) {
        return value.toString();
      }
      
      // Escape quotes in strings
      if (typeof value === 'string') {
        return `"${value.replace(/"/g, '""')}"`;
      }
      
      return value;
    }).join(',');
  }).join('\n');
  
  // Combine header and rows
  return `${header}\n${rows}`;
};

/**
 * Format date for reports
 */
export const formatReportDate = (date: number): string => {
  return new Date(date).toLocaleDateString();
};

/**
 * Format currency for reports
 */
export const formatReportCurrency = (amount?: number): string => {
  if (!amount) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};
