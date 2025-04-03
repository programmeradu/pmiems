/**
 * Database migration utility for the PSI-SUSAS Membership Data Management System
 * This file handles database migrations and initialization
 */

import { SCHEMA } from './schema';

// Current database version
export const CURRENT_VERSION = 2;

// Interface for database version tracking
export interface DBVersion {
  version: number;
  timestamp: number;
}

// Migration functions
export const initializeDatabase = (db: any) => {
  // Create version table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS db_version (
      version INTEGER PRIMARY KEY,
      timestamp INTEGER NOT NULL
    )
  `);
  
  // Check current version
  const versionRow = db.prepare('SELECT version FROM db_version ORDER BY version DESC LIMIT 1').get();
  const currentVersion = versionRow ? versionRow.version : 0;
  
  // Run migrations if needed
  if (currentVersion < CURRENT_VERSION) {
    runMigrations(db, currentVersion);
  }
};

const runMigrations = (db: any, fromVersion: number) => {
  // Start a transaction for all migrations
  db.transaction(() => {
    // For each version that needs migration
    for (let version = fromVersion + 1; version <= CURRENT_VERSION; version++) {
      console.log(`Running migration to version ${version}`);
      
      // Run the specific migration for this version
      const migrationFn = migrations[version];
      if (migrationFn) {
        migrationFn(db);
      }
      
      // Update the version number
      db.prepare('INSERT INTO db_version (version, timestamp) VALUES (?, ?)').run(
        version, Date.now()
      );
    }
  })();
  
  console.log(`Database migrated to version ${CURRENT_VERSION}`);
};

// Migration functions for each version
const migrations: { [version: number]: (db: any) => void } = {
  1: (db: any) => {
    // Initial schema creation
    db.exec(SCHEMA.USERS_TABLE);
    db.exec(SCHEMA.DEPARTMENTS_TABLE);
    db.exec(SCHEMA.POSITIONS_TABLE);
    
    // Create a default admin user if none exists
    const hasAdmin = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin');
    
    if (!hasAdmin || hasAdmin.count === 0) {
      createDefaultAdmin(db);
    }
    
    // Create some default departments and positions for testing
    createDefaultData(db);
  },
  2: (db: any) => {
    // Add members table for PSI-SUSAS Membership Data Management System
    db.exec(SCHEMA.MEMBERS_TABLE);
    console.log('Added members table for PSI-SUSAS Membership Data Management');
  }
};

// Helper to create default admin
const createDefaultAdmin = (db: any) => {
  const crypto = require('crypto');
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.pbkdf2Sync('admin', salt, 1000, 64, 'sha512').toString('hex');
  
  const now = Date.now();
  
  db.prepare(`
    INSERT INTO users (username, password_hash, salt, role, name, email, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run('admin', passwordHash, salt, 'admin', 'Administrator', 'admin@example.com', now, now);
  
  console.log('Created default admin user with username: admin, password: admin');
};

// Helper to create some default data
const createDefaultData = (db: any) => {
  const now = Date.now();
  
  // Create default departments
  const departmentIds: { [name: string]: number } = {};
  
  ['HR', 'Engineering', 'Marketing', 'Finance', 'Operations'].forEach(deptName => {
    const result = db.prepare(`
      INSERT INTO departments (name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `).run(deptName, `${deptName} Department`, now, now);
    
    departmentIds[deptName] = result.lastInsertRowid;
  });
  
  // Create default positions
  const positionData = [
    { title: 'HR Manager', departmentName: 'HR', description: 'Manages HR functions' },
    { title: 'HR Assistant', departmentName: 'HR', description: 'Assists HR manager' },
    { title: 'Software Engineer', departmentName: 'Engineering', description: 'Develops software' },
    { title: 'QA Engineer', departmentName: 'Engineering', description: 'Tests software' },
    { title: 'Engineering Manager', departmentName: 'Engineering', description: 'Manages engineering team' },
    { title: 'Marketing Specialist', departmentName: 'Marketing', description: 'Handles marketing campaigns' },
    { title: 'Marketing Manager', departmentName: 'Marketing', description: 'Manages marketing team' },
    { title: 'Accountant', departmentName: 'Finance', description: 'Handles accounting' },
    { title: 'Financial Analyst', departmentName: 'Finance', description: 'Analyzes financial data' },
    { title: 'Operations Manager', departmentName: 'Operations', description: 'Manages operations' },
    { title: 'Operations Assistant', departmentName: 'Operations', description: 'Assists operations manager' }
  ];
  
  positionData.forEach(position => {
    db.prepare(`
      INSERT INTO positions (title, department_id, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      position.title,
      departmentIds[position.departmentName],
      position.description,
      now,
      now
    );
  });
  
  console.log('Created default departments and positions');
};
