# Step-by-Step Role Assignment Demonstration

## Demo Overview
This guide demonstrates assigning a **Company Administrator** role to a demo user named "Demo Company Owner".

## Prerequisites
- You must be logged in as **Super Administrator** or **Company Administrator**
- Demo user should already exist: `demo_owner` / `demo@company.com` / `demo123`

## Method 1: Through User Permissions Page (Recommended)

### Step 1: Navigate to User Permissions
1. **Login** as Super Administrator (`sysadmin_7f3a2b8e`)
2. **Click** on **"Company"** in the main navigation menu
3. **Select** **"User Permissions"** from the dropdown

### Step 2: Open Role Assignment Dialog
1. **Click** the **"Assign Role"** button (top right corner)
2. A dialog titled **"Assign Role to User"** will open

### Step 3: Fill Assignment Form
**User Selection:**
- **Click** the **"Select a user"** dropdown
- **Choose** **"Demo Company Owner (demo_owner)"**

**Role Selection:**
- **Click** the **"Select a system role"** dropdown  
- **Choose** **"Company Administrator (Level 9)"**
- Leave **"Company Role"** as **"No Company Role"** (optional)

**Reason:**
- **Type**: `"Assigning company administrator privileges for business management and user oversight"`

### Step 4: Confirm Assignment
1. **Click** **"Assign Role"** button
2. **Success message** should appear: *"Role assigned successfully"*
3. **Dialog closes** automatically

### Step 5: Verify Assignment
**Visual Confirmation:**
- User **"Demo Company Owner"** now appears in the permissions list
- **Badge** shows **"Company Admin"** with blue gradient styling
- **Role level** displays as **"Level 9"**

**Detailed Verification:**
1. **Click** on the user row to expand details
2. **Verify** system role shows: **"Company Administrator"**
3. **Access areas** should include:
   - Company Management
   - All Modules  
   - User Management
   - Company Settings

## Method 2: Through Role Management Page

### Step 1: Navigate to Role Management
1. **Go to** **Company → Role Management**
2. **Click** **"System Role Management"** tab

### Step 2: Find Company Administrator Role
1. **Locate** the **"Company Administrator"** role card
2. **Click** the role card or **"Manage Role"** button
3. **Role detail dialog** opens

### Step 3: Assign to User
1. **Click** **"Assign to Users"** button in dialog
2. **Follow** same assignment process as Method 1
3. **Role** will be pre-selected as **"Company Administrator"**

## Expected Results After Assignment

### User Capabilities
**Demo Company Owner** can now:
- ✅ **Manage all company data** and settings
- ✅ **Create and manage users** within the company  
- ✅ **Access financial reports** and accounting data
- ✅ **Configure company settings** and preferences
- ✅ **View and manage all business modules**
- ❌ **Cannot access other companies** (company-specific role)
- ❌ **Cannot access Super Admin functions** (platform restrictions)

### Role Hierarchy Verification
- **Level 9** (Company Administrator) permissions active
- **Inherits** all permissions from levels 1-8
- **Restricted** from Level 10 (Super Administrator) functions

## Troubleshooting Common Issues

### Issue: User Not in Dropdown
**Solution:**
- Ensure user account is **active** (`isActive = true`)
- Check user was **created successfully**
- **Refresh** the page and try again

### Issue: Role Assignment Failed  
**Solution:**
- Verify you have **sufficient permissions** to assign roles
- Check user doesn't **already have** the role assigned  
- Ensure the role is **active** in the system

### Issue: Permissions Not Working
**Solution:**
- Ask user to **log out and log back in**
- Wait a few minutes for **permission propagation**
- Check **audit logs** to confirm assignment was recorded

## Audit Trail Verification

### Step 1: Check Audit Logs
1. **Go to** **Company → Audit Logs** (or Super Admin Panel)
2. **Look for** recent entry with:
   - **Action**: "Role Assignment"
   - **User**: Your admin username
   - **Resource**: "demo_owner"
   - **Details**: Role assignment information

### Step 2: Verify User Permissions
1. **Navigate to** **User Permissions** page
2. **Click** on **"Demo Company Owner"** row  
3. **Confirm** role information displays correctly
4. **Check** permission effective date is current

## Testing New Permissions

### Login as Demo User
1. **Log out** of admin account
2. **Login** as demo user:
   - Username: `demo_owner`
   - Password: `demo123`

### Verify Access
**Should Have Access To:**
- ✅ Dashboard with full company statistics
- ✅ All navigation menu items
- ✅ User management sections
- ✅ Financial reports and data
- ✅ Company settings page

**Should NOT Have Access To:**
- ❌ Super Admin Panel (red button not visible)
- ❌ Cross-company operations
- ❌ Platform-wide settings

## Success Criteria
✅ **User appears** in permissions list with correct badge  
✅ **Role assignment** recorded in audit logs  
✅ **User can login** and access company functions  
✅ **Navigation menus** show appropriate items for role level  
✅ **Settings pages** accessible with company admin permissions  
✅ **Financial reports** display with full company data access  

## Next Steps
- **Test other role assignments** using same process
- **Create additional demo users** for different role levels
- **Verify role hierarchy** by testing permission inheritance
- **Review audit logs** regularly for role assignment compliance

---
**Demonstration Complete**: Demo user successfully assigned Company Administrator role with full verification of permissions and access levels.