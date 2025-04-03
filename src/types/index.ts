import { Member } from './Member';

// User type definition
export interface User {
  id: number;
  username: string;
  role: string;
  name: string;
  email: string | null;
}

// Department type definition
export interface Department {
  id: number;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}

// Position type definition
export interface Position {
  id: number;
  title: string;
  department_id: number;
  department_name?: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}

// Re-export Member type
export type { Member };

// Employee type for backward compatibility (will be removed)
export interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  hireDate: string;
  status: string;
  rating?: number;
  salary?: number;
  performance?: number;
  tenure?: number;
  skills?: string[];
  managerId?: number;
  teamId?: number;
  created_at: number;
  updated_at: number;
}