/**
 * Member type definition for the PSI-SUSAS Membership Data Management System
 */
export interface Member {
  id: number;
  serial_number: string;
  first_name: string;
  last_name: string;
  other_names: string | null;
  sex: string | null;
  age: number | null;
  marital_status: string | null;
  email: string | null;
  contact_number: string | null;
  current_address: string | null;
  country_region: string | null;
  social_security_number: string | null;
  children_count: number | null;
  employer: string | null;
  employment_type: string | null;
  date_of_employment: number | null;
  place_of_work: string | null;
  department_id: number | null;
  department_name?: string;
  position_id: number | null;
  position_title?: string;
  membership_id: string | null;
  membership_date: number | null;
  membership_position: string | null;
  created_at: number;
  updated_at: number;
}