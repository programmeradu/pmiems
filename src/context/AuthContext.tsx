import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { getStoredUser } from '../services/authService';
import * as authService from '../services/authService';

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  resetPassword: (username: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for our provider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider component that manages authentication state
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  /**
   * Login function
   */
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await authService.login(username, password);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, message: result.message || 'Login failed' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  /**
   * Reset password function
   */
  const resetPassword = async (username: string) => {
    setIsLoading(true);
    try {
      const result = await authService.resetPassword(username);
      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update password function
   */
  const updatePassword = async (token: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const result = await authService.updatePassword(token, newPassword);
      return result;
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        login, 
        logout, 
        resetPassword, 
        updatePassword 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};