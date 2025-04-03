/**
 * IPC utility functions for the PSI-SUSAS Membership Data Management System
 * These functions provide a wrapper around the Electron IPC API for the renderer process
 */

// Define interfaces for localStorage data structures
interface Department {
  id: number;
  name: string;
  description?: string;
  created_at: number;
  updated_at: number;
}

interface Position {
  id: number;
  title: string;
  department_id: number;
  description?: string;
  created_at: number;
  updated_at: number;
}

interface Member {
  id: number;
  serial_number: string;
  first_name: string;
  last_name: string;
  other_names?: string;
  department_id?: number;
  position_id?: number;
  membership_date?: number;
  [key: string]: any; // For other properties that may exist
}

/**
 * Check if Electron API is available
 */
export const hasElectronAPI = (): boolean => {
  return typeof window !== 'undefined' && !!window.electronAPI;
};

/**
 * Get statistics from member data for browser-based development
 * This uses real data from localStorage instead of mock data
 */
const getMemberDataStats = () => {
  try {
    // Get members data from localStorage
    const storedMembers = localStorage.getItem('members');
    const members: Member[] = storedMembers ? JSON.parse(storedMembers) : [];
    
    // Get departments and positions from localStorage (if they exist)
    const storedDepartments = localStorage.getItem('departments');
    const departments: Department[] = storedDepartments ? JSON.parse(storedDepartments) : [];
    
    const storedPositions = localStorage.getItem('positions');
    const positions: Position[] = storedPositions ? JSON.parse(storedPositions) : [];
    
    // Group members by department
    const departmentDistribution = departments.map((dept: Department) => {
      const memberCount = members.filter((m: Member) => m.department_id === dept.id).length;
      return {
        name: dept.name,
        employee_count: memberCount
      };
    }).filter((dept) => dept.employee_count > 0);
    
    // Sort members by membership_date to get "recent hires"
    const recentHires = [...members]
      .sort((a: Member, b: Member) => {
        const dateA = a.membership_date || 0;
        const dateB = b.membership_date || 0;
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((member: Member) => ({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        hire_date: member.membership_date,
        position_title: positions.find((p: Position) => p.id === member.position_id)?.title || '',
        department_name: departments.find((d: Department) => d.id === member.department_id)?.name || ''
      }));
    
    return {
      success: true,
      stats: {
        employeeCount: members.length,
        departmentCount: departments.length,
        positionCount: positions.length,
        departmentDistribution,
        recentHires
      }
    };
  } catch (error) {
    console.error('Error generating stats from localStorage data:', error);
    return {
      success: false,
      message: 'Failed to generate statistics from local data'
    };
  }
};

// Dashboard related functions
export const getDashboardStats = async () => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.getDashboardStats();
    } else {
      // Use real data from localStorage
      console.log('Running in browser, generating dashboard stats from local storage data');
      return getMemberDataStats();
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return { success: false, message: 'Failed to get dashboard statistics' };
  }
};

// Employee related functions
export const getAllEmployees = async () => {
  try {
    // Check if running in Electron
    if (window.electronAPI) {
      return await window.electronAPI.getAllEmployees();
    } else {
      // Mock data for development in browser (not Electron)
      console.log('Running in browser, using mock data for employees');
      return { success: true, employees: [] };
    }
  } catch (error) {
    console.error('Error getting all employees:', error);
    return { success: false, message: 'Failed to get employees' };
  }
};

export const getEmployeeById = async (id: number) => {
  try {
    // Check if running in Electron
    if (window.electronAPI) {
      return await window.electronAPI.getEmployeeById(id);
    } else {
      // Mock data for development in browser (not Electron)
      console.log(`Running in browser, using mock data for employee ${id}`);
      return { success: false, message: 'Employee not found' };
    }
  } catch (error) {
    console.error(`Error getting employee ${id}:`, error);
    return { success: false, message: 'Failed to get employee details' };
  }
};

export const createEmployee = async (employee: any) => {
  try {
    // Check if running in Electron
    if (window.electronAPI) {
      return await window.electronAPI.createEmployee(employee);
    } else {
      // Mock data for development in browser (not Electron)
      console.log('Running in browser, cannot create employee');
      return { success: false, message: 'Cannot create employee in browser mode' };
    }
  } catch (error) {
    console.error('Error creating employee:', error);
    return { success: false, message: 'Failed to create employee' };
  }
};

export const updateEmployee = async (employee: any) => {
  try {
    // Check if running in Electron
    if (window.electronAPI) {
      return await window.electronAPI.updateEmployee(employee);
    } else {
      // Mock data for development in browser (not Electron)
      console.log(`Running in browser, cannot update employee ${employee.id}`);
      return { success: false, message: 'Cannot update employee in browser mode' };
    }
  } catch (error) {
    console.error(`Error updating employee ${employee.id}:`, error);
    return { success: false, message: 'Failed to update employee' };
  }
};

export const deleteEmployee = async (id: number) => {
  try {
    // Check if running in Electron
    if (window.electronAPI) {
      return await window.electronAPI.deleteEmployee(id);
    } else {
      // Mock data for development in browser (not Electron)
      console.log(`Running in browser, cannot delete employee ${id}`);
      return { success: false, message: 'Cannot delete employee in browser mode' };
    }
  } catch (error) {
    console.error(`Error deleting employee ${id}:`, error);
    return { success: false, message: 'Failed to delete employee' };
  }
};

// Helper function for getting departments from localStorage
const getDepartmentsFromStorage = () => {
  try {
    const storedData = localStorage.getItem('departments');
    if (storedData) {
      const departments = JSON.parse(storedData);
      return { success: true, departments };
    }
    return { success: true, departments: [] };
  } catch (error) {
    console.error('Error getting departments from storage:', error);
    return { success: false, message: 'Failed to retrieve departments from storage' };
  }
};

// Department related functions
export const getAllDepartments = async () => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.getAllDepartments();
    } else {
      // Get real data from localStorage
      console.log('Running in browser, getting departments from localStorage');
      return getDepartmentsFromStorage();
    }
  } catch (error) {
    console.error('Error getting all departments:', error);
    return { success: false, message: 'Failed to get departments' };
  }
};

// Helper function to save departments to localStorage
const saveDepartmentsToStorage = (departments: Department[]) => {
  try {
    localStorage.setItem('departments', JSON.stringify(departments));
    return true;
  } catch (error) {
    console.error('Error saving departments to localStorage:', error);
    return false;
  }
};

export const createDepartment = async (department: Partial<Department>) => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.createDepartment(department);
    } else {
      // Create in localStorage
      console.log('Running in browser, creating department in localStorage');
      
      const { success, departments } = getDepartmentsFromStorage();
      if (!success) {
        return { success: false, message: 'Failed to access departments storage' };
      }
      
      // Create a new department with a unique ID
      const newId = departments.length > 0 
        ? Math.max(...departments.map((d: Department) => d.id)) + 1 
        : 1;
        
      const timestamp = Date.now();
      const newDepartment: Department = {
        id: newId,
        name: department.name || 'New Department',
        description: department.description,
        created_at: timestamp,
        updated_at: timestamp
      };
      
      // Add to array and save
      departments.push(newDepartment);
      const saveResult = saveDepartmentsToStorage(departments);
      
      if (saveResult) {
        return { success: true, department: newDepartment };
      } else {
        return { success: false, message: 'Failed to save department to storage' };
      }
    }
  } catch (error) {
    console.error('Error creating department:', error);
    return { success: false, message: 'Failed to create department' };
  }
};

export const updateDepartment = async (department: Partial<Department> & { id: number }) => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.updateDepartment(department);
    } else {
      // Update in localStorage
      console.log(`Running in browser, updating department ${department.id} in localStorage`);
      
      const { success, departments } = getDepartmentsFromStorage();
      if (!success) {
        return { success: false, message: 'Failed to access departments storage' };
      }
      
      // Find the department to update
      const index = departments.findIndex((d: Department) => d.id === department.id);
      if (index === -1) {
        return { success: false, message: 'Department not found' };
      }
      
      // Update the department
      const updatedDepartment = {
        ...departments[index],
        ...department,
        updated_at: Date.now()
      };
      
      departments[index] = updatedDepartment;
      const saveResult = saveDepartmentsToStorage(departments);
      
      if (saveResult) {
        return { success: true, department: updatedDepartment };
      } else {
        return { success: false, message: 'Failed to save updated department to storage' };
      }
    }
  } catch (error) {
    console.error(`Error updating department ${department.id}:`, error);
    return { success: false, message: 'Failed to update department' };
  }
};

export const deleteDepartment = async (id: number) => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.deleteDepartment(id);
    } else {
      // Delete from localStorage
      console.log(`Running in browser, deleting department ${id} from localStorage`);
      
      const { success, departments } = getDepartmentsFromStorage();
      if (!success) {
        return { success: false, message: 'Failed to access departments storage' };
      }
      
      // Check if department exists
      const index = departments.findIndex((d: Department) => d.id === id);
      if (index === -1) {
        return { success: false, message: 'Department not found' };
      }
      
      // Remove the department
      departments.splice(index, 1);
      const saveResult = saveDepartmentsToStorage(departments);
      
      if (saveResult) {
        return { success: true, message: 'Department deleted successfully' };
      } else {
        return { success: false, message: 'Failed to save changes to storage' };
      }
    }
  } catch (error) {
    console.error(`Error deleting department ${id}:`, error);
    return { success: false, message: 'Failed to delete department' };
  }
};

// Helper function for getting positions from localStorage
const getPositionsFromStorage = () => {
  try {
    const storedData = localStorage.getItem('positions');
    if (storedData) {
      const positions = JSON.parse(storedData);
      return { success: true, positions };
    }
    return { success: true, positions: [] };
  } catch (error) {
    console.error('Error getting positions from storage:', error);
    return { success: false, message: 'Failed to retrieve positions from storage' };
  }
};

// Position related functions
export const getAllPositions = async () => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.getAllPositions();
    } else {
      // Get real data from localStorage
      console.log('Running in browser, getting positions from localStorage');
      return getPositionsFromStorage();
    }
  } catch (error) {
    console.error('Error getting all positions:', error);
    return { success: false, message: 'Failed to get positions' };
  }
};

export const getPositionsByDepartment = async (departmentId: number) => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.getPositionsByDepartment(departmentId);
    } else {
      // Filter positions from localStorage by department
      console.log(`Running in browser, filtering positions for department ${departmentId} from localStorage`);
      const { success, positions, message } = getPositionsFromStorage();
      
      if (!success) {
        return { success, message };
      }
      
      // Filter positions by department_id
      const filteredPositions = positions.filter((position: Position) => position.department_id === departmentId);
      return { success: true, positions: filteredPositions };
    }
  } catch (error) {
    console.error(`Error getting positions for department ${departmentId}:`, error);
    return { success: false, message: 'Failed to get positions for department' };
  }
};

// Helper function to save positions to localStorage
const savePositionsToStorage = (positions: Position[]) => {
  try {
    localStorage.setItem('positions', JSON.stringify(positions));
    return true;
  } catch (error) {
    console.error('Error saving positions to localStorage:', error);
    return false;
  }
};

export const createPosition = async (position: Partial<Position>) => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.createPosition(position);
    } else {
      // Create in localStorage
      console.log('Running in browser, creating position in localStorage');
      
      const { success, positions } = getPositionsFromStorage();
      if (!success) {
        return { success: false, message: 'Failed to access positions storage' };
      }
      
      // Create a new position with a unique ID
      const newId = positions.length > 0 
        ? Math.max(...positions.map((p: Position) => p.id)) + 1 
        : 1;
        
      const timestamp = Date.now();
      const newPosition: Position = {
        id: newId,
        title: position.title || 'New Position',
        department_id: position.department_id || 0,
        description: position.description,
        created_at: timestamp,
        updated_at: timestamp
      };
      
      // Add to array and save
      positions.push(newPosition);
      const saveResult = savePositionsToStorage(positions);
      
      if (saveResult) {
        return { success: true, position: newPosition };
      } else {
        return { success: false, message: 'Failed to save position to storage' };
      }
    }
  } catch (error) {
    console.error('Error creating position:', error);
    return { success: false, message: 'Failed to create position' };
  }
};

export const updatePosition = async (position: Partial<Position> & { id: number }) => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.updatePosition(position);
    } else {
      // Update in localStorage
      console.log(`Running in browser, updating position ${position.id} in localStorage`);
      
      const { success, positions } = getPositionsFromStorage();
      if (!success) {
        return { success: false, message: 'Failed to access positions storage' };
      }
      
      // Find the position to update
      const index = positions.findIndex((p: Position) => p.id === position.id);
      if (index === -1) {
        return { success: false, message: 'Position not found' };
      }
      
      // Update the position
      const updatedPosition = {
        ...positions[index],
        ...position,
        updated_at: Date.now()
      };
      
      positions[index] = updatedPosition;
      const saveResult = savePositionsToStorage(positions);
      
      if (saveResult) {
        return { success: true, position: updatedPosition };
      } else {
        return { success: false, message: 'Failed to save updated position to storage' };
      }
    }
  } catch (error) {
    console.error(`Error updating position ${position.id}:`, error);
    return { success: false, message: 'Failed to update position' };
  }
};

export const deletePosition = async (id: number) => {
  try {
    // Check if running in Electron
    if (hasElectronAPI()) {
      return await window.electronAPI.deletePosition(id);
    } else {
      // Delete from localStorage
      console.log(`Running in browser, deleting position ${id} from localStorage`);
      
      const { success, positions } = getPositionsFromStorage();
      if (!success) {
        return { success: false, message: 'Failed to access positions storage' };
      }
      
      // Check if position exists
      const index = positions.findIndex((p: Position) => p.id === id);
      if (index === -1) {
        return { success: false, message: 'Position not found' };
      }
      
      // Remove the position
      positions.splice(index, 1);
      const saveResult = savePositionsToStorage(positions);
      
      if (saveResult) {
        return { success: true, message: 'Position deleted successfully' };
      } else {
        return { success: false, message: 'Failed to save changes to storage' };
      }
    }
  } catch (error) {
    console.error(`Error deleting position ${id}:`, error);
    return { success: false, message: 'Failed to delete position' };
  }
};