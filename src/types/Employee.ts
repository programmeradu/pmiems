/**
 * Employee type definition for the Employee Management System
 */
export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  position_id: number;
  position_title?: string;
  department_id: number;
  department_name?: string;
  hire_date: number;
  salary: number | null;
  profile_photo: string | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
}