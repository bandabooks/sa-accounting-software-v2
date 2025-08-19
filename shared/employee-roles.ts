// Employee Role and Permission Definitions
export const EMPLOYEE_ROLES = {
  EMPLOYEE: 'employee',
  SUPERVISOR: 'supervisor', 
  MANAGER: 'manager',
  HR_ADMIN: 'hr_admin',
  PAYROLL_ADMIN: 'payroll_admin'
} as const;

export const EMPLOYEE_PERMISSIONS = {
  // Personal Data Access
  VIEW_OWN_PROFILE: 'employee:view_own_profile',
  EDIT_OWN_PROFILE: 'employee:edit_own_profile',
  VIEW_OWN_PAYSLIPS: 'employee:view_own_payslips',
  VIEW_OWN_ATTENDANCE: 'employee:view_own_attendance',
  VIEW_OWN_LEAVE: 'employee:view_own_leave',
  
  // Time & Attendance
  CLOCK_IN_OUT: 'employee:clock_in_out',
  SUBMIT_TIMESHEET: 'employee:submit_timesheet',
  REQUEST_LEAVE: 'employee:request_leave',
  
  // Employee Management (Supervisory)
  VIEW_TEAM_PROFILES: 'employee:view_team_profiles',
  VIEW_TEAM_ATTENDANCE: 'employee:view_team_attendance',
  APPROVE_TEAM_LEAVE: 'employee:approve_team_leave',
  VIEW_TEAM_PERFORMANCE: 'employee:view_team_performance',
  
  // HR Administration
  VIEW_ALL_EMPLOYEES: 'employee:view_all_employees',
  CREATE_EMPLOYEE: 'employee:create_employee',
  EDIT_EMPLOYEE: 'employee:edit_employee',
  DELETE_EMPLOYEE: 'employee:delete_employee',
  MANAGE_EMPLOYEE_ROLES: 'employee:manage_employee_roles',
  VIEW_EMPLOYEE_REPORTS: 'employee:view_employee_reports',
  
  // Payroll Administration
  VIEW_ALL_PAYROLL: 'employee:view_all_payroll',
  CREATE_PAYROLL: 'employee:create_payroll',
  PROCESS_PAYROLL: 'employee:process_payroll',
  APPROVE_PAYROLL: 'employee:approve_payroll',
  VIEW_PAYROLL_REPORTS: 'employee:view_payroll_reports',
  
  // Leave Management
  VIEW_ALL_LEAVE: 'employee:view_all_leave',
  APPROVE_LEAVE: 'employee:approve_leave',
  MANAGE_LEAVE_POLICIES: 'employee:manage_leave_policies',
  
  // Performance Management
  VIEW_PERFORMANCE_REVIEWS: 'employee:view_performance_reviews',
  CONDUCT_REVIEWS: 'employee:conduct_reviews',
  MANAGE_GOALS: 'employee:manage_goals'
} as const;

// Base permissions for employee role
const EMPLOYEE_PERMISSIONS_BASE = [
  EMPLOYEE_PERMISSIONS.VIEW_OWN_PROFILE,
  EMPLOYEE_PERMISSIONS.EDIT_OWN_PROFILE,
  EMPLOYEE_PERMISSIONS.VIEW_OWN_PAYSLIPS,
  EMPLOYEE_PERMISSIONS.VIEW_OWN_ATTENDANCE,
  EMPLOYEE_PERMISSIONS.VIEW_OWN_LEAVE,
  EMPLOYEE_PERMISSIONS.CLOCK_IN_OUT,
  EMPLOYEE_PERMISSIONS.SUBMIT_TIMESHEET,
  EMPLOYEE_PERMISSIONS.REQUEST_LEAVE
];

// Supervisor permissions (includes employee + supervisor specific)
const SUPERVISOR_PERMISSIONS_BASE = [
  ...EMPLOYEE_PERMISSIONS_BASE,
  EMPLOYEE_PERMISSIONS.VIEW_TEAM_PROFILES,
  EMPLOYEE_PERMISSIONS.VIEW_TEAM_ATTENDANCE,
  EMPLOYEE_PERMISSIONS.APPROVE_TEAM_LEAVE,
  EMPLOYEE_PERMISSIONS.VIEW_TEAM_PERFORMANCE
];

// Manager permissions (includes supervisor + manager specific)
const MANAGER_PERMISSIONS_BASE = [
  ...SUPERVISOR_PERMISSIONS_BASE,
  EMPLOYEE_PERMISSIONS.VIEW_ALL_EMPLOYEES,
  EMPLOYEE_PERMISSIONS.VIEW_EMPLOYEE_REPORTS,
  EMPLOYEE_PERMISSIONS.VIEW_ALL_LEAVE,
  EMPLOYEE_PERMISSIONS.APPROVE_LEAVE,
  EMPLOYEE_PERMISSIONS.VIEW_PERFORMANCE_REVIEWS,
  EMPLOYEE_PERMISSIONS.CONDUCT_REVIEWS,
  EMPLOYEE_PERMISSIONS.MANAGE_GOALS
];

// HR Admin permissions (includes manager + HR specific)
const HR_ADMIN_PERMISSIONS_BASE = [
  ...MANAGER_PERMISSIONS_BASE,
  EMPLOYEE_PERMISSIONS.CREATE_EMPLOYEE,
  EMPLOYEE_PERMISSIONS.EDIT_EMPLOYEE,
  EMPLOYEE_PERMISSIONS.DELETE_EMPLOYEE,
  EMPLOYEE_PERMISSIONS.MANAGE_EMPLOYEE_ROLES,
  EMPLOYEE_PERMISSIONS.MANAGE_LEAVE_POLICIES
];

// Payroll Admin permissions (basic + payroll specific)
const PAYROLL_ADMIN_PERMISSIONS_BASE = [
  EMPLOYEE_PERMISSIONS.VIEW_OWN_PROFILE,
  EMPLOYEE_PERMISSIONS.VIEW_ALL_EMPLOYEES,
  EMPLOYEE_PERMISSIONS.VIEW_ALL_PAYROLL,
  EMPLOYEE_PERMISSIONS.CREATE_PAYROLL,
  EMPLOYEE_PERMISSIONS.PROCESS_PAYROLL,
  EMPLOYEE_PERMISSIONS.APPROVE_PAYROLL,
  EMPLOYEE_PERMISSIONS.VIEW_PAYROLL_REPORTS
];

// Default permissions for each role
export const ROLE_PERMISSIONS = {
  [EMPLOYEE_ROLES.EMPLOYEE]: EMPLOYEE_PERMISSIONS_BASE,
  [EMPLOYEE_ROLES.SUPERVISOR]: SUPERVISOR_PERMISSIONS_BASE,
  [EMPLOYEE_ROLES.MANAGER]: MANAGER_PERMISSIONS_BASE,
  [EMPLOYEE_ROLES.HR_ADMIN]: HR_ADMIN_PERMISSIONS_BASE,
  [EMPLOYEE_ROLES.PAYROLL_ADMIN]: PAYROLL_ADMIN_PERMISSIONS_BASE
};

// Role display information
export const ROLE_DISPLAY_INFO = {
  [EMPLOYEE_ROLES.EMPLOYEE]: {
    name: 'Employee',
    description: 'Basic employee access - view own information, clock in/out, request leave',
    color: 'bg-blue-100 text-blue-800',
    level: 1
  },
  [EMPLOYEE_ROLES.SUPERVISOR]: {
    name: 'Supervisor',
    description: 'Team lead access - manage team attendance and approve team leave requests',
    color: 'bg-green-100 text-green-800',
    level: 2
  },
  [EMPLOYEE_ROLES.MANAGER]: {
    name: 'Manager',
    description: 'Department management - view all employees, approve leave, conduct reviews',
    color: 'bg-purple-100 text-purple-800',
    level: 3
  },
  [EMPLOYEE_ROLES.HR_ADMIN]: {
    name: 'HR Administrator',
    description: 'Full HR access - manage employees, roles, and HR policies',
    color: 'bg-orange-100 text-orange-800',
    level: 4
  },
  [EMPLOYEE_ROLES.PAYROLL_ADMIN]: {
    name: 'Payroll Administrator',
    description: 'Payroll management - process salaries, generate payroll reports',
    color: 'bg-red-100 text-red-800',
    level: 4
  }
};

// Helper function to check if an employee has a specific permission
export function hasEmployeePermission(employeeRole: string, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS[employeeRole as keyof typeof ROLE_PERMISSIONS];
  return rolePermissions?.includes(permission as any) || false;
}

// Helper function to get all permissions for a role
export function getEmployeePermissions(role: string): string[] {
  return ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || [];
}