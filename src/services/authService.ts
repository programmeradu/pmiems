/**
 * Authentication Service for the Employee Management System
 */
import { User } from '../types';

const LOCAL_STORAGE_USER_KEY = 'ems_user';

export interface LoginResult {
  success: boolean;
  user?: User;
  message?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message: string;
}

/**
 * Login with username and password
 */
export const login = async (username: string, password: string): Promise<LoginResult> => {
  try {
    // For now, we'll use a mock implementation until we connect with the Electron backend
    // In a real implementation, this would call the Electron IPC to authenticate
    
    // Mock admin user
    if (username === 'admin' && password === 'admin') {
      const user: User = {
        id: 1,
        username: 'admin',
        name: 'Administrator',
        email: 'admin@example.com',
        role: 'admin',
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      
      // Store user in localStorage
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      
      return {
        success: true,
        user,
      };
    }
    
    // Mock regular user
    if (username === 'user' && password === 'user') {
      const user: User = {
        id: 2,
        username: 'user',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user',
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      
      // Store user in localStorage
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
      
      return {
        success: true,
        user,
      };
    }
    
    return {
      success: false,
      message: 'Invalid username or password',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
};

/**
 * Request password reset
 */
export const resetPassword = async (username: string): Promise<ResetPasswordResult> => {
  try {
    // Mock implementation for now
    if (username === 'admin' || username === 'user') {
      return {
        success: true,
        message: 'Password reset email sent. Please check your inbox.',
      };
    }
    
    return {
      success: false,
      message: 'User not found',
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};

/**
 * Update password with reset token
 */
export const updatePassword = async (token: string, newPassword: string): Promise<ResetPasswordResult> => {
  try {
    // Mock implementation for now
    if (token === 'valid-token') {
      return {
        success: true,
        message: 'Password updated successfully',
      };
    }
    
    return {
      success: false,
      message: 'Invalid or expired token',
    };
  } catch (error) {
    console.error('Update password error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
};

/**
 * Check if user has admin role
 */
export const isAdmin = (user: User | null): boolean => {
  return !!user && user.role === 'admin';
};

/**
 * Get the stored user from local storage
 */
export const getStoredUser = (): User | null => {
  const userJson = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return null;
  }
};