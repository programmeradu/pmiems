/**
 * Department Service for the PSI-SUSAS Membership Data Management System
 */
import { Department } from '../types';

// Define window.electronAPI interface
declare global {
  interface Window {
    electronAPI: {
      getAllDepartments: () => Promise<{ success: boolean; departments?: any[]; message?: string }>;
      createDepartment: (department: any) => Promise<{ success: boolean; department?: any; message?: string }>;
      updateDepartment: (department: any) => Promise<{ success: boolean; department?: any; message?: string }>;
      deleteDepartment: (id: number) => Promise<{ success: boolean; message: string }>;
    };
  }
}

export interface DepartmentResult {
  success: boolean;
  department?: Department;
  message?: string;
}

export interface DepartmentsResult {
  success: boolean;
  departments?: Department[];
  message?: string;
}

/**
 * Get all departments
 */
export const getAllDepartments = async (): Promise<DepartmentsResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      const result = await window.electronAPI.getAllDepartments();
      return result;
    } else {
      // In dev environment without Electron, return empty array
      return {
        success: true,
        departments: [],
      };
    }
  } catch (error) {
    console.error('Error fetching departments:', error);
    return {
      success: false,
      message: 'Failed to fetch departments',
    };
  }
};

/**
 * Create a new department
 */
export const createDepartment = async (department: Partial<Department>): Promise<DepartmentResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      // Add timestamps
      const departmentWithTimestamps = {
        ...department,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      
      const result = await window.electronAPI.createDepartment(departmentWithTimestamps);
      return result;
    } else {
      // In dev environment without Electron, return mock success
      return {
        success: true,
        department: {
          id: 1,
          name: department.name || '',
          description: department.description || null,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      };
    }
  } catch (error) {
    console.error('Error creating department:', error);
    return {
      success: false,
      message: 'Failed to create department',
    };
  }
};

/**
 * Update an existing department
 */
export const updateDepartment = async (department: Partial<Department> & { id: number }): Promise<DepartmentResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      // Update timestamp
      const departmentWithTimestamp = {
        ...department,
        updated_at: Date.now(),
      };
      
      const result = await window.electronAPI.updateDepartment(departmentWithTimestamp);
      return result;
    } else {
      // In dev environment without Electron, return mock success
      return {
        success: true,
        department: {
          ...department,
          updated_at: Date.now(),
        } as Department,
      };
    }
  } catch (error) {
    console.error(`Error updating department ${department.id}:`, error);
    return {
      success: false,
      message: 'Failed to update department',
    };
  }
};

/**
 * Delete a department
 */
export const deleteDepartment = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      const result = await window.electronAPI.deleteDepartment(id);
      return result;
    } else {
      // In dev environment without Electron, return mock success
      return {
        success: true,
        message: 'Department deleted successfully',
      };
    }
  } catch (error) {
    console.error(`Error deleting department ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete department',
    };
  }
};