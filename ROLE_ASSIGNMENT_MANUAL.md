# Role Assignment Manual - Step by Step Guide

## Overview
This manual provides complete instructions for assigning roles to users in the Taxnify platform. The system supports both System Roles (platform-wide) and Company Roles (company-specific).

## Available System Roles (by Level)

### 1. Super Administrator (Level 10)
- **Purpose**: Platform owners with unrestricted access
- **Access**: All system functions, cross-company operations
- **Use Case**: Platform administrators only

### 2. Company Administrator (Level 9) 
- **Purpose**: Highest authority within individual companies
- **Access**: All company data and settings (no cross-company access)
- **Use Case**: Business owners, managing directors

### 3. Accountant (Level 7)
- **Purpose**: Qualified accounting professionals
- **Access**: Financial data, reporting, transaction management
- **Use Case**: CAs, professional accountants

### 4. Bookkeeper (Level 6)
- **Purpose**: Daily transaction recording specialists
- **Access**: Transaction entry, invoice management, basic reports  
- **Use Case**: Bookkeeping staff, data entry personnel

### 5. Auditor (Level 6)
- **Purpose**: External or internal auditors
- **Access**: Read-only financial records, audit reports
- **Use Case**: Auditing firms, compliance officers

### 6. Manager (Level 5)
- **Purpose**: Department managers
- **Access**: Department reports, team management, operational data
- **Use Case**: Operations managers, department heads

### 7. Sales Representative (Level 4)
- **Purpose**: Sales and customer relationship management
- **Access**: Customer management, quotes, invoices, sales reports
- **Use Case**: Sales team members

### 8. Cashier (Level 3)
- **Purpose**: Point of sale operations
- **Access**: POS system, cash handling, daily sales
- **Use Case**: Retail cashiers, front-desk staff

### 9. Payroll Administrator (Level 3)
- **Purpose**: Payroll processing and employee management
- **Access**: Payroll system, employee records, tax calculations
- **Use Case**: HR personnel, payroll specialists

### 10. Compliance Officer (Level 4)
- **Purpose**: Regulatory compliance management
- **Access**: VAT returns, SARS submissions, compliance reporting
- **Use Case**: Tax specialists, compliance managers

### 11. Employee (Level 2)
- **Purpose**: General staff members
- **Access**: Personal dashboard, timesheets, basic reports
- **Use Case**: Regular employees

### 12. Viewer (Level 1)
- **Purpose**: Limited read-only access
- **Access**: Basic dashboards, summary data
- **Use Case**: Stakeholders, investors, external parties

## Step-by-Step Role Assignment Process

### Method 1: Through User Permissions Page

#### Step 1: Navigate to User Permissions
1. Log in as Super Administrator or Company Administrator
2. Click on **Company** in the main navigation
3. Select **User Permissions** from the dropdown menu

#### Step 2: Assign Role to User
1. Click the **"Assign Role"** button in the top right
2. In the dialog that opens:
   - **Select User**: Choose from dropdown of active users
   - **System Role**: Choose the appropriate system role (optional)
   - **Company Role**: Choose company-specific role (optional)
   - **Reason**: Enter justification for audit purposes
3. Click **"Assign Role"** to confirm

#### Step 3: Verify Assignment
1. The user will appear in the permissions list
2. Their role badge will update to reflect the new assignment
3. Check the audit logs for confirmation

### Method 2: Through Role Management Page

#### Step 1: Navigate to Role Management
1. Log in as Super Administrator or Company Administrator  
2. Click on **Company** in the main navigation
3. Select **Role Management** from the dropdown menu

#### Step 2: Select Role
1. Choose the **"System Role Management"** tab
2. Click on any role card to view details
3. Click **"Assign to Users"** button in the role detail dialog

#### Step 3: Complete Assignment
1. Follow the same assignment dialog process as Method 1
2. The system will pre-select the role you clicked on

### Method 3: Through Super Admin Panel

#### Step 1: Access Super Admin Panel
1. Log in as Super Administrator
2. Click the red **"Super Admin Panel"** button in navigation
3. Select **"User Management"** tab

#### Step 2: Edit User
1. Find the user in the list
2. Click **"Edit"** button next to their name
3. Update their role in the user edit form
4. Click **"Save Changes"**

## Demonstration: Creating Demo User and Assigning Company Owner Role

### Step 1: Create Demo User
```sql
-- This will be done via the application interface
Username: demo_owner
Name: Demo Company Owner  
Email: demo@company.com
Password: demo123
Initial Role: Employee (will be upgraded)
```

### Step 2: Assign Company Administrator Role
1. Navigate to **Company → User Permissions**
2. Click **"Assign Role"** 
3. Select:
   - **User**: Demo Company Owner (demo_owner)
   - **System Role**: Company Administrator (Level 9)
   - **Reason**: "Demo user for testing company owner permissions"
4. Click **"Assign Role"**

### Step 3: Verify Permissions
The demo user will now have:
- ✅ Full company management access
- ✅ User management capabilities
- ✅ Financial data access
- ✅ Settings and configuration access
- ✅ All company modules access
- ❌ No cross-company access (restricted to their company)

## Important Notes

### Security Considerations
- **Super Administrator**: Only assign to trusted platform administrators
- **Company Administrator**: Only assign to business owners or managing directors
- **Audit Trail**: All role assignments are logged for compliance
- **Principle of Least Privilege**: Assign minimum role needed for job function

### Role Hierarchy
- Higher level roles inherit permissions from lower levels
- Users can have both System Role and Company Role simultaneously
- System Roles apply globally, Company Roles apply to specific company only

### Troubleshooting

#### User Not Appearing in Dropdown
- Ensure user account is active (`isActive = true`)
- Check user has been created successfully
- Verify you have permission to assign roles to this user

#### Role Assignment Failed
- Check user doesn't already have the role assigned
- Verify you have sufficient permissions to assign this role level
- Ensure the role is active in the system

#### Permission Not Working After Assignment
- Role assignments may take a few minutes to propagate
- Ask user to log out and log back in
- Check audit logs to confirm assignment was recorded

## API Endpoints for Programmatic Assignment

### Assign Role
```http
POST /api/rbac/assign-role
Content-Type: application/json

{
  "userId": 123,
  "systemRoleId": 456,
  "companyRoleId": null,
  "reason": "Business justification"
}
```

### Check User Permissions
```http
GET /api/rbac/user-permissions/:userId
```

### Get Available Roles
```http
GET /api/rbac/system-roles
GET /api/rbac/company-roles
```

## Best Practices

1. **Regular Audit**: Review role assignments quarterly
2. **Documentation**: Always provide reason for role assignments
3. **Testing**: Test permissions after assignment in a safe environment
4. **Backup**: Document critical role assignments for disaster recovery
5. **Training**: Ensure users understand their new permissions and responsibilities

---

**Last Updated**: January 25, 2025  
**Version**: 1.0  
**Contact**: For support, contact your system administrator