const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script for communication between Electron main process and renderer
 * Using CommonJS format for compatibility with Electron
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  login: (username, password) => ipcRenderer.invoke('auth:login', username, password),
  resetPassword: (username) => ipcRenderer.invoke('auth:reset-password', username),
  updatePassword: (token, newPassword) => ipcRenderer.invoke('auth:update-password', token, newPassword),
  
  // Departments
  getAllDepartments: () => ipcRenderer.invoke('departments:getAll'),
  createDepartment: (department) => ipcRenderer.invoke('departments:create', department),
  updateDepartment: (department) => ipcRenderer.invoke('departments:update', department),
  deleteDepartment: (id) => ipcRenderer.invoke('departments:delete', id),
  
  // Positions
  getAllPositions: () => ipcRenderer.invoke('positions:getAll'),
  getPositionsByDepartment: (departmentId) => ipcRenderer.invoke('positions:getByDepartment', departmentId),
  createPosition: (position) => ipcRenderer.invoke('positions:create', position),
  updatePosition: (position) => ipcRenderer.invoke('positions:update', position),
  deletePosition: (id) => ipcRenderer.invoke('positions:delete', id),
  
  // Employees
  getAllEmployees: () => ipcRenderer.invoke('employees:getAll'),
  getEmployeeById: (id) => ipcRenderer.invoke('employees:getById', id),
  createEmployee: (employee) => ipcRenderer.invoke('employees:create', employee),
  updateEmployee: (employee) => ipcRenderer.invoke('employees:update', employee),
  deleteEmployee: (id) => ipcRenderer.invoke('employees:delete', id),
  
  // Dashboard
  getDashboardStats: () => ipcRenderer.invoke('dashboard:getStats'),
});

// Ensure proper error handling for module loading issues
window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error);
});
