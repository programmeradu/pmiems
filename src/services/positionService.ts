/**
 * Position Service for the PSI-SUSAS Membership Data Management System
 */
import { Position } from '../types';

// Define window.electronAPI interface
declare global {
  interface Window {
    electronAPI: {
      getAllPositions: () => Promise<{ success: boolean; positions?: any[]; message?: string }>;
      getPositionsByDepartment: (departmentId: number) => Promise<{ success: boolean; positions?: any[]; message?: string }>;
      createPosition: (position: any) => Promise<{ success: boolean; position?: any; message?: string }>;
      updatePosition: (position: any) => Promise<{ success: boolean; position?: any; message?: string }>;
      deletePosition: (id: number) => Promise<{ success: boolean; message: string }>;
    };
  }
}

export interface PositionResult {
  success: boolean;
  position?: Position;
  message?: string;
}

export interface PositionsResult {
  success: boolean;
  positions?: Position[];
  message?: string;
}

/**
 * Get all positions
 */
export const getAllPositions = async (): Promise<PositionsResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      const result = await window.electronAPI.getAllPositions();
      return result;
    } else {
      // In dev environment without Electron, return empty array
      return {
        success: true,
        positions: [],
      };
    }
  } catch (error) {
    console.error('Error fetching positions:', error);
    return {
      success: false,
      message: 'Failed to fetch positions',
    };
  }
};

/**
 * Get positions by department
 */
export const getPositionsByDepartment = async (departmentId: number): Promise<PositionsResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      const result = await window.electronAPI.getPositionsByDepartment(departmentId);
      return result;
    } else {
      // In dev environment without Electron, return empty array
      return {
        success: true,
        positions: [],
      };
    }
  } catch (error) {
    console.error(`Error fetching positions for department ${departmentId}:`, error);
    return {
      success: false,
      message: 'Failed to fetch positions',
    };
  }
};

/**
 * Create a new position
 */
export const createPosition = async (position: Partial<Position>): Promise<PositionResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      // Add timestamps
      const positionWithTimestamps = {
        ...position,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      
      const result = await window.electronAPI.createPosition(positionWithTimestamps);
      return result;
    } else {
      // In dev environment without Electron, return mock success
      return {
        success: true,
        position: {
          id: 1,
          title: position.title || '',
          department_id: position.department_id || 0,
          description: position.description || null,
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      };
    }
  } catch (error) {
    console.error('Error creating position:', error);
    return {
      success: false,
      message: 'Failed to create position',
    };
  }
};

/**
 * Update an existing position
 */
export const updatePosition = async (position: Partial<Position> & { id: number }): Promise<PositionResult> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      // Update timestamp
      const positionWithTimestamp = {
        ...position,
        updated_at: Date.now(),
      };
      
      const result = await window.electronAPI.updatePosition(positionWithTimestamp);
      return result;
    } else {
      // In dev environment without Electron, return mock success
      return {
        success: true,
        position: {
          ...position,
          updated_at: Date.now(),
        } as Position,
      };
    }
  } catch (error) {
    console.error(`Error updating position ${position.id}:`, error);
    return {
      success: false,
      message: 'Failed to update position',
    };
  }
};

/**
 * Delete a position
 */
export const deletePosition = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    // When running in Electron, use the electronAPI
    if (window.electronAPI) {
      const result = await window.electronAPI.deletePosition(id);
      return result;
    } else {
      // In dev environment without Electron, return mock success
      return {
        success: true,
        message: 'Position deleted successfully',
      };
    }
  } catch (error) {
    console.error(`Error deleting position ${id}:`, error);
    return {
      success: false,
      message: 'Failed to delete position',
    };
  }
};