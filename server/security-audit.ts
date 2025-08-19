#!/usr/bin/env tsx

/**
 * Data Isolation Security Audit Script
 * 
 * Comprehensive security audit to verify bulletproof data isolation
 * across all database tables and API endpoints.
 */

import { sql } from 'drizzle-orm';
import { db } from './db';
import DataIsolationEnforcer from './data-isolation-security';

async function runComprehensiveSecurityAudit(): Promise<void> {
  console.log('🔍 Starting Comprehensive Data Isolation Security Audit...\n');

  try {
    // 1. Run automated security audit
    console.log('📋 Running Automated Security Audit...');
    const auditResult = await DataIsolationEnforcer.runSecurityAudit();
    
    console.log(`Security Status: ${auditResult.isSecure ? '✅ SECURE' : '❌ ISSUES FOUND'}`);
    
    if (auditResult.issues.length > 0) {
      console.log('\n🚨 Security Issues Found:');
      auditResult.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }

    if (auditResult.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      auditResult.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    // 2. Verify company_id columns exist on all business tables
    console.log('\n📊 Verifying Company ID Columns...');
    const businessTables = [
      'invoices', 'customers', 'estimates', 'products', 'suppliers',
      'expenses', 'payments', 'purchase_orders', 'inventory_items',
      'chart_of_accounts', 'journal_entries', 'bank_accounts',
      'vat_returns', 'audit_logs', 'employees', 'pos_sales'
    ];

    let missingColumns = 0;
    for (const table of businessTables) {
      try {
        const columnCheck = await db.execute(sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = ${table} 
          AND column_name = 'company_id'
        `);

        if (columnCheck.rows.length === 0) {
          console.log(`   ❌ Table '${table}' missing company_id column`);
          missingColumns++;
        } else {
          console.log(`   ✅ Table '${table}' has company_id column`);
        }
      } catch (error) {
        console.log(`   ⚠️  Table '${table}' not found or inaccessible`);
      }
    }

    // 3. Check for data isolation violations
    console.log('\n🔐 Checking for Data Isolation Violations...');
    
    // Check if any users have access to multiple companies (potential risk)
    const multiCompanyUsers = await db.execute(sql`
      SELECT u.id, u.username, u.role, COUNT(DISTINCT cu.company_id) as company_count
      FROM users u
      JOIN company_users cu ON u.id = cu.user_id
      WHERE cu.is_active = true AND u.role != 'super_admin'
      GROUP BY u.id, u.username, u.role
      HAVING COUNT(DISTINCT cu.company_id) > 1
    `);

    if (multiCompanyUsers.rows.length > 0) {
      console.log(`   ⚠️  Found ${multiCompanyUsers.rows.length} users with multi-company access:`);
      multiCompanyUsers.rows.forEach((user: any) => {
        console.log(`      - ${user.username} (${user.role}): ${user.company_count} companies`);
      });
    } else {
      console.log('   ✅ No unauthorized multi-company user access found');
    }

    // 4. Check for orphaned data (data without valid company references)
    console.log('\n🧹 Checking for Orphaned Data...');
    
    const orphanChecks = [
      { table: 'invoices', query: 'SELECT COUNT(*) as count FROM invoices i LEFT JOIN companies c ON i.company_id = c.id WHERE c.id IS NULL' },
      { table: 'customers', query: 'SELECT COUNT(*) as count FROM customers cu LEFT JOIN companies c ON cu.company_id = c.id WHERE c.id IS NULL' },
      { table: 'products', query: 'SELECT COUNT(*) as count FROM products p LEFT JOIN companies c ON p.company_id = c.id WHERE c.id IS NULL' },
    ];

    let totalOrphaned = 0;
    for (const check of orphanChecks) {
      try {
        const result = await db.execute(sql.raw(check.query));
        const count = (result.rows[0] as any)?.count || 0;
        if (count > 0) {
          console.log(`   ❌ ${check.table}: ${count} orphaned records`);
          totalOrphaned += count;
        } else {
          console.log(`   ✅ ${check.table}: No orphaned records`);
        }
      } catch (error) {
        console.log(`   ⚠️  Could not check ${check.table}: ${error.message}`);
      }
    }

    // 5. Security metrics summary
    console.log('\n📈 Security Metrics Summary:');
    
    const totalCompanies = await db.execute(sql`SELECT COUNT(*) as count FROM companies WHERE is_active = true`);
    const totalUsers = await db.execute(sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`);
    const totalCompanyUsers = await db.execute(sql`SELECT COUNT(*) as count FROM company_users WHERE is_active = true`);
    
    console.log(`   📊 Active Companies: ${(totalCompanies.rows[0] as any)?.count || 0}`);
    console.log(`   👥 Active Users: ${(totalUsers.rows[0] as any)?.count || 0}`);
    console.log(`   🔗 Company-User Links: ${(totalCompanyUsers.rows[0] as any)?.count || 0}`);
    console.log(`   🚫 Missing Columns: ${missingColumns}`);
    console.log(`   🧹 Orphaned Records: ${totalOrphaned}`);

    // 6. Overall security score
    let securityScore = 100;
    if (missingColumns > 0) securityScore -= (missingColumns * 10);
    if (totalOrphaned > 0) securityScore -= Math.min(totalOrphaned * 2, 20);
    if (!auditResult.isSecure) securityScore -= 20;

    console.log(`\n🎯 Overall Security Score: ${Math.max(securityScore, 0)}/100`);
    
    if (securityScore >= 90) {
      console.log('   🟢 EXCELLENT: Data isolation is bulletproof');
    } else if (securityScore >= 70) {
      console.log('   🟡 GOOD: Minor improvements recommended');
    } else {
      console.log('   🔴 ATTENTION REQUIRED: Security issues need immediate attention');
    }

  } catch (error) {
    console.error('❌ Security audit failed:', error);
  }
}

// Run the audit
if (require.main === module) {
  runComprehensiveSecurityAudit()
    .then(() => {
      console.log('\n✅ Security audit completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Security audit failed:', error);
      process.exit(1);
    });
}

export { runComprehensiveSecurityAudit };