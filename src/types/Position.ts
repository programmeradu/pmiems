/**
 * Position type definition for the Employee Management System
 */
export interface Position {
  id: number;
  title: string;
  department_id: number;
  department_name?: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}