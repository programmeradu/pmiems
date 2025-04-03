/**
 * Department type definition for the Employee Management System
 */
export interface Department {
  id: number;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}