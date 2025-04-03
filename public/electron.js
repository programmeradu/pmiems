const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store').default || require('electron-store');
const crypto = require('crypto');

// Enable experimental ESM support if needed
if (process.env.NODE_ENV === 'development') {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

// Convert paths to handle loading
function fixPathForElectronAsar(url) {
  return url.replace('app:///', `file://${__dirname}/`);
}

// Define Node environment
process.env.NODE_ENV = process.env.NODE_ENV || (app.isPackaged ? 'production' : 'development');
const isDev = process.env.NODE_ENV === 'development';

// Keep a global reference of the window object
let mainWindow;
let store;

// Database setup using Store for simplicity
function setupDatabase() {
  try {
    store = new Store({
      name: 'psi_susas_membership',
      fileExtension: 'json'  // Using JSON file instead of SQLite to avoid native module dependencies
    });
    
    // Initialize database with default data if empty
    initializeDatabase();
    
    return store;
  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  }
}

function initializeDatabase() {
  // Check if we have any users
  const users = store.get('users') || [];
  
  // Create a default admin user if none exists
  if (!users.some(user => user.role === 'admin')) {
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.pbkdf2Sync('admin', salt, 1000, 64, 'sha512').toString('hex');
    
    const now = Date.now();
    
    const adminUser = {
      id: 1,
      username: 'admin',
      password_hash: passwordHash,
      salt: salt,
      role: 'admin',
      name: 'Administrator',
      email: 'admin@example.com',
      created_at: now,
      updated_at: now
    };
    
    users.push(adminUser);
    store.set('users', users);
    store.set('departments', []);
    store.set('positions', []);
    store.set('employees', []);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      // Enable webSecurity but handle navigation internally
      webSecurity: true
    },
    show: false
  });

  // Always load from the built files to avoid localhost connection errors
  const startUrl = `file://${path.join(__dirname, '../build_output/index.html')}`;

  // Load the app
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
    
    // Fallback if the main URL fails
    const fallbackUrl = `file://${path.join(__dirname, '../index.html')}`;
    mainWindow.loadURL(fallbackUrl).catch(e => {
      console.error('Failed to load fallback URL:', e);
    });
  });
  
  // Show window when ready to avoid blank screen flashes
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Handle web navigation events to prevent file:// protocol errors
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    
    // If it's an internal route (not actually a file path)
    if (parsedUrl.protocol === 'file:' && !fs.existsSync(parsedUrl.pathname)) {
      event.preventDefault();
      
      // Reload the main app and let React Router handle the route
      mainWindow.loadURL(startUrl);
    }
  });
  
  // Handle external links - prevent file:// protocol errors
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      // Open external URLs in browser
      require('electron').shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  try {
    setupDatabase();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Error during app initialization:', error);
    dialog.showErrorBox('Application Error', 
      `An error occurred during application startup: ${error.message}\n\nPlease contact support.`);
    app.exit(1);
  }
}).catch(error => {
  console.error('Fatal error during app startup:', error);
  dialog.showErrorBox('Fatal Error', 
    `A fatal error occurred during application startup: ${error.message}\n\nPlease contact support.`);
  app.exit(1);
});

// Error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  
  if (mainWindow && !mainWindow.isDestroyed()) {
    dialog.showErrorBox('Uncaught Exception', 
      `An unexpected error occurred: ${error.message}\n\nThe application will now close.`);
  }
  
  app.exit(1);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for authentication
ipcMain.handle('auth:login', async (event, username, password) => {
  try {
    const users = store.get('users') || [];
    const user = users.find(u => u.username === username);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    const hash = crypto.pbkdf2Sync(password, user.salt, 1000, 64, 'sha512').toString('hex');
    
    if (hash === user.password_hash) {
      // Don't send password_hash and salt to the client
      const { password_hash, salt, ...safeUser } = user;
      return { success: true, user: safeUser };
    } else {
      return { success: false, message: 'Invalid password' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'An error occurred during login' };
  }
});

ipcMain.handle('auth:reset-password', async (event, username) => {
  try {
    const user = store.get('users').find(u => u.username === username);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    
    const users = store.get('users').map(u =>
      u.username === username ? { ...u, reset_token: resetToken, reset_token_expiry: resetTokenExpiry } : u
    );
    store.set('users', users);
    
    return { 
      success: true, 
      message: 'Password reset token generated. In a real app, this would be sent via email.' 
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, message: 'An error occurred while generating reset token' };
  }
});

ipcMain.handle('auth:update-password', async (event, token, newPassword) => {
  try {
    const users = store.get('users') || [];
    const user = users.find(u => u.reset_token === token && u.reset_token_expiry > Date.now());
    
    if (!user) {
      return { success: false, message: 'Invalid or expired token' };
    }
    
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = crypto.pbkdf2Sync(newPassword, salt, 1000, 64, 'sha512').toString('hex');
    
    const updatedUsers = users.map(u =>
      u.username === user.username ? { ...u, password_hash: passwordHash, salt: salt, reset_token: null, reset_token_expiry: null, updated_at: Date.now() } : u
    );
    store.set('users', updatedUsers);
    
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, message: 'An error occurred while updating password' };
  }
});

// Department handlers
ipcMain.handle('departments:getAll', async () => {
  try {
    const departments = store.get('departments') || [];
    return { success: true, departments };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return { success: false, message: 'Failed to fetch departments' };
  }
});

ipcMain.handle('departments:create', async (event, department) => {
  try {
    const departments = store.get('departments') || [];
    const now = Date.now();
    const newDepartment = { ...department, id: departments.length + 1, created_at: now, updated_at: now };
    const updatedDepartments = [...departments, newDepartment];
    store.set('departments', updatedDepartments);
    return { success: true, department: newDepartment };
  } catch (error) {
    console.error('Error creating department:', error);
    return { success: false, message: 'Failed to create department' };
  }
});

ipcMain.handle('departments:update', async (event, department) => {
  try {
    const departments = store.get('departments') || [];
    const now = Date.now();
    const updatedDepartments = departments.map(d =>
      d.id === department.id ? { ...d, ...department, updated_at: now } : d
    );
    store.set('departments', updatedDepartments);
    const updatedDepartment = updatedDepartments.find(d => d.id === department.id);
    return { success: true, department: updatedDepartment };
  } catch (error) {
    console.error('Error updating department:', error);
    return { success: false, message: 'Failed to update department' };
  }
});

ipcMain.handle('departments:delete', async (event, id) => {
  try {
    const departments = store.get('departments') || [];
    const updatedDepartments = departments.filter(d => d.id !== id);
    store.set('departments', updatedDepartments);
    return { success: true, message: 'Department deleted successfully' };
  } catch (error) {
    console.error('Error deleting department:', error);
    return { success: false, message: 'Failed to delete department' };
  }
});

// Position handlers
ipcMain.handle('positions:getAll', async () => {
  try {
    const positions = store.get('positions') || [];
    return { success: true, positions };
  } catch (error) {
    console.error('Error fetching positions:', error);
    return { success: false, message: 'Failed to fetch positions' };
  }
});

ipcMain.handle('positions:getByDepartment', async (event, departmentId) => {
  try {
    const positions = store.get('positions') || [];
    const departmentPositions = positions.filter(p => p.department_id === departmentId);
    return { success: true, positions: departmentPositions };
  } catch (error) {
    console.error('Error fetching positions by department:', error);
    return { success: false, message: 'Failed to fetch positions' };
  }
});

ipcMain.handle('positions:create', async (event, position) => {
  try {
    const positions = store.get('positions') || [];
    const now = Date.now();
    const newPosition = { ...position, id: positions.length + 1, created_at: now, updated_at: now };
    const updatedPositions = [...positions, newPosition];
    store.set('positions', updatedPositions);
    return { success: true, position: newPosition };
  } catch (error) {
    console.error('Error creating position:', error);
    return { success: false, message: 'Failed to create position' };
  }
});

ipcMain.handle('positions:update', async (event, position) => {
  try {
    const positions = store.get('positions') || [];
    const updatedPositions = positions.map(p =>
      p.id === position.id ? { ...p, ...position, updated_at: Date.now() } : p
    );
    store.set('positions', updatedPositions);
    const updatedPosition = updatedPositions.find(p => p.id === position.id);
    return { success: true, position: updatedPosition };
  } catch (error) {
    console.error('Error updating position:', error);
    return { success: false, message: 'Failed to update position' };
  }
});

ipcMain.handle('positions:delete', async (event, id) => {
  try {
    const positions = store.get('positions') || [];
    const updatedPositions = positions.filter(p => p.id !== id);
    store.set('positions', updatedPositions);
    return { success: true, message: 'Position deleted successfully' };
  } catch (error) {
    console.error('Error deleting position:', error);
    return { success: false, message: 'Failed to delete position' };
  }
});

// Employee handlers
ipcMain.handle('employees:getAll', async () => {
  try {
    const employees = store.get('employees') || [];
    return { success: true, employees };
  } catch (error) {
    console.error('Error fetching employees:', error);
    return { success: false, message: 'Failed to fetch employees' };
  }
});

ipcMain.handle('employees:getById', async (event, id) => {
  try {
    const employees = store.get('employees') || [];
    const employee = employees.find(e => e.id === id);
    
    if (!employee) {
      return { success: false, message: 'Employee not found' };
    }
    
    return { success: true, employee };
  } catch (error) {
    console.error('Error fetching employee:', error);
    return { success: false, message: 'Failed to fetch employee' };
  }
});

ipcMain.handle('employees:create', async (event, employee) => {
  try {
    const employees = store.get('employees') || [];
    const now = Date.now();
    const newEmployee = { ...employee, id: employees.length + 1, created_at: now, updated_at: now };
    const updatedEmployees = [...employees, newEmployee];
    store.set('employees', updatedEmployees);
    return { success: true, employee: newEmployee };
  } catch (error) {
    console.error('Error creating employee:', error);
    return { success: false, message: 'Failed to create employee' };
  }
});

ipcMain.handle('employees:update', async (event, employee) => {
  try {
    const employees = store.get('employees') || [];
    const updatedEmployees = employees.map(e =>
      e.id === employee.id ? { ...e, ...employee, updated_at: Date.now() } : e
    );
    store.set('employees', updatedEmployees);
    const updatedEmployee = updatedEmployees.find(e => e.id === employee.id);
    return { success: true, employee: updatedEmployee };
  } catch (error) {
    console.error('Error updating employee:', error);
    return { success: false, message: 'Failed to update employee' };
  }
});

ipcMain.handle('employees:delete', async (event, id) => {
  try {
    const employees = store.get('employees') || [];
    const updatedEmployees = employees.filter(e => e.id !== id);
    store.set('employees', updatedEmployees);
    return { success: true, message: 'Employee deleted successfully' };
  } catch (error) {
    console.error('Error deleting employee:', error);
    return { success: false, message: 'Failed to delete employee' };
  }
});

// Dashboard statistics
ipcMain.handle('dashboard:getStats', async () => {
  try {
    const employees = store.get('employees') || [];
    const departments = store.get('departments') || [];
    const positions = store.get('positions') || [];
    
    const employeeCount = employees.length;
    const departmentCount = departments.length;
    const positionCount = positions.length;
    
    const departmentDistribution = departments.map(d => ({
      name: d.name,
      employee_count: employees.filter(e => e.department_id === d.id).length
    }));
    
    const recentHires = employees.slice(-5);
    
    return { 
      success: true, 
      stats: {
        employeeCount,
        departmentCount,
        positionCount,
        departmentDistribution,
        recentHires
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return { success: false, message: 'Failed to fetch dashboard statistics' };
  }
});
