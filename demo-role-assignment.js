#!/usr/bin/env node

/**
 * Demo Role Assignment Script
 * This script demonstrates how to assign roles to users programmatically
 */

const BASE_URL = 'http://localhost:5000';

// Demo user data
const demoUser = {
  username: 'demo_owner',
  name: 'Demo Company Owner', 
  email: 'demo@company.com',
  password: 'demo123'
};

// Role assignment data
const roleAssignment = {
  userId: null, // Will be set after user creation
  systemRoleId: 2, // Company Administrator (Level 9)
  companyRoleId: null,
  reason: 'Demo assignment for testing company owner permissions'
};

async function makeRequest(endpoint, method = 'GET', data = null, sessionToken = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  if (sessionToken) {
    options.headers['Cookie'] = `sessionToken=${sessionToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      console.error(`❌ ${method} ${endpoint} failed:`, result);
      return null;
    }

    console.log(`✅ ${method} ${endpoint} success:`, result);
    return result;
  } catch (error) {
    console.error(`❌ Request failed:`, error.message);
    return null;
  }
}

async function demonstrateRoleAssignment() {
  console.log('🚀 Starting Role Assignment Demonstration');
  console.log('=====================================\n');

  // Step 1: Create demo user
  console.log('Step 1: Creating demo user...');
  const userResult = await makeRequest('/api/register', 'POST', demoUser);
  
  if (!userResult) {
    console.log('⚠️  User might already exist, trying to login...');
    
    // Try to login instead
    const loginResult = await makeRequest('/api/login', 'POST', {
      username: demoUser.username,
      password: demoUser.password
    });
    
    if (!loginResult) {
      console.error('❌ Could not create or login demo user');
      return;
    }
    
    console.log('✅ Logged in existing demo user');
  }

  // Step 2: Get user ID
  console.log('\nStep 2: Getting user information...');
  const usersResult = await makeRequest('/api/users');
  
  if (!usersResult) {
    console.error('❌ Could not fetch users');
    return;
  }

  const demoUserRecord = usersResult.find(u => u.username === demoUser.username);
  if (!demoUserRecord) {
    console.error('❌ Demo user not found in users list');
    return;
  }

  roleAssignment.userId = demoUserRecord.id;
  console.log(`✅ Found demo user with ID: ${demoUserRecord.id}`);

  // Step 3: Get available roles
  console.log('\nStep 3: Getting available system roles...');
  const rolesResult = await makeRequest('/api/rbac/system-roles');
  
  if (rolesResult) {
    console.log('📋 Available System Roles:');
    rolesResult.forEach(role => {
      console.log(`   - ${role.displayName} (Level ${role.level})`);
    });
    
    // Find Company Administrator role
    const companyAdminRole = rolesResult.find(r => r.name === 'company_admin');
    if (companyAdminRole) {
      roleAssignment.systemRoleId = companyAdminRole.id;
      console.log(`✅ Will assign: ${companyAdminRole.displayName} (ID: ${companyAdminRole.id})`);
    }
  }

  // Step 4: Assign role (requires authentication)
  console.log('\nStep 4: Assigning Company Administrator role...');
  console.log('⚠️  Note: This step requires authentication. In the web interface:');
  console.log('   1. Login as Super Admin or Company Admin');
  console.log('   2. Go to Company → User Permissions');
  console.log('   3. Click "Assign Role"');
  console.log('   4. Select:');
  console.log(`      - User: ${demoUser.name} (${demoUser.username})`);
  console.log(`      - System Role: Company Administrator (Level 9)`);
  console.log(`      - Reason: ${roleAssignment.reason}`);
  console.log('   5. Click "Assign Role"');

  // Step 5: Verification instructions
  console.log('\nStep 5: Verification...');
  console.log('After assignment, verify by:');
  console.log('   1. Checking the User Permissions page');
  console.log('   2. Looking for the user in the list with "Company Admin" badge');
  console.log('   3. Clicking on the user to see detailed permissions');
  console.log('   4. Checking audit logs for the assignment record');

  console.log('\n🎉 Demo Role Assignment Instructions Complete!');
  console.log('=====================================');
}

// Node.js compatibility check
if (typeof fetch === 'undefined') {
  console.log('⚠️  This script requires Node.js 18+ with fetch support');
  console.log('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

// Run the demonstration
demonstrateRoleAssignment().catch(console.error);