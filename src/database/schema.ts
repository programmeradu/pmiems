/**
 * Database schema definition for the PSI-SUSAS Membership Data Management System
 * This file defines the types and schema for the database tables
 */

import { Member, Department, Position, User } from '../types';

export interface DBUser {
  id: number;
  username: string;
  password_hash: string;
  salt: string;
  role: string;
  name: string;
  email: string | null;
  reset_token: string | null;
  reset_token_expiry: number | null;
  created_at: number;
  updated_at: number;
}

export interface DBDepartment {
  id: number;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}

export interface DBPosition {
  id: number;
  title: string;
  department_id: number;
  description: string | null;
  created_at: number;
  updated_at: number;
}

export interface DBMember {
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
  position_id: number | null;
  membership_id: string | null;
  membership_date: number | null;
  membership_position: string | null;
  created_at: number;
  updated_at: number;
}

// Database schema as SQL statements
export const SCHEMA = {
  USERS_TABLE: `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      reset_token TEXT,
      reset_token_expiry INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `,
  
  DEPARTMENTS_TABLE: `
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `,
  
  POSITIONS_TABLE: `
    CREATE TABLE IF NOT EXISTS positions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      department_id INTEGER NOT NULL,
      description TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (department_id) REFERENCES departments (id)
    )
  `,
  
  MEMBERS_TABLE: `
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      serial_number TEXT NOT NULL UNIQUE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      other_names TEXT,
      sex TEXT,
      age INTEGER,
      marital_status TEXT,
      email TEXT,
      contact_number TEXT,
      current_address TEXT,
      country_region TEXT,
      social_security_number TEXT,
      children_count INTEGER,
      employer TEXT,
      employment_type TEXT,
      date_of_employment INTEGER,
      place_of_work TEXT,
      department_id INTEGER,
      position_id INTEGER,
      membership_id TEXT,
      membership_date INTEGER,
      membership_position TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (position_id) REFERENCES positions (id),
      FOREIGN KEY (department_id) REFERENCES departments (id)
    )
  `
};

// Helper functions to convert between DB and application types
export const mapUserFromDB = (dbUser: DBUser): User => {
  const { password_hash, salt, reset_token, reset_token_expiry, ...user } = dbUser;
  return {
    ...user,
    role: user.role as 'admin' | 'user'
  };
};

export const mapDepartmentFromDB = (dbDepartment: DBDepartment): Department => {
  return {
    ...dbDepartment
  };
};

export const mapPositionFromDB = (dbPosition: DBPosition, departmentName?: string): Position => {
  return {
    ...dbPosition,
    department_name: departmentName
  };
};

export const mapMemberFromDB = (
  dbMember: DBMember, 
  positionTitle?: string, 
  departmentName?: string
): Member => {
  return {
    ...dbMember,
    position_title: positionTitle,
    department_name: departmentName
  };
};
