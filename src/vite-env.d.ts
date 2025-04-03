/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  electronAPI: {
    // Authentication
    login: (username: string, password: string) => Promise<{ success: boolean; user?: any; message?: string }>;
    resetPassword: (username: string) => Promise<{ success: boolean; message: string }>;
    updatePassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
    
    // Departments
    getAllDepartments: () => Promise<{ success: boolean; departments?: any[]; message?: string }>;
    createDepartment: (department: any) => Promise<{ success: boolean; department?: any; message?: string }>;
    updateDepartment: (department: any) => Promise<{ success: boolean; department?: any; message?: string }>;
    deleteDepartment: (id: number) => Promise<{ success: boolean; message: string }>;
    
    // Positions
    getAllPositions: () => Promise<{ success: boolean; positions?: any[]; message?: string }>;
    getPositionsByDepartment: (departmentId: number) => Promise<{ success: boolean; positions?: any[]; message?: string }>;
    createPosition: (position: any) => Promise<{ success: boolean; position?: any; message?: string }>;
    updatePosition: (position: any) => Promise<{ success: boolean; position?: any; message?: string }>;
    deletePosition: (id: number) => Promise<{ success: boolean; message: string }>;
    
    // Employees
    getAllEmployees: () => Promise<{ success: boolean; employees?: any[]; message?: string }>;
    getEmployeeById: (id: number) => Promise<{ success: boolean; employee?: any; message?: string }>;
    createEmployee: (employee: any) => Promise<{ success: boolean; employee?: any; message?: string }>;
    updateEmployee: (employee: any) => Promise<{ success: boolean; employee?: any; message?: string }>;
    deleteEmployee: (id: number) => Promise<{ success: boolean; message: string }>;
    
    // Members
    getAllMembers: () => Promise<{ success: boolean; members?: any[]; message?: string }>;
    getMemberById: (id: number) => Promise<{ success: boolean; member?: any; message?: string }>;
    createMember: (member: any) => Promise<{ success: boolean; member?: any; message?: string }>;
    updateMember: (member: any) => Promise<{ success: boolean; member?: any; message?: string }>;
    deleteMember: (id: number) => Promise<{ success: boolean; message: string }>;
    getMemberCountByDepartment: () => Promise<{ success: boolean; data?: { name: string; member_count: number }[]; message?: string }>;
    
    // Dashboard
    getDashboardStats: () => Promise<{ success: boolean; stats?: any; message?: string }>;
  };
}
