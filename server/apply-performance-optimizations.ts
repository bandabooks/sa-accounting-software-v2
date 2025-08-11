import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import fs from 'fs';
import path from 'path';

/**
 * Apply database performance optimizations
 * This script creates indexes and optimizes database performance
 */
export async function applyDatabaseOptimizations() {
  console.log('🚀 Starting database performance optimizations...');
  
  // Initialize database connection
  const sql_client = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql_client);
  
  try {
    // Read the SQL optimization script
    const sqlPath = path.join(__dirname, 'database-optimizations.sql');
    const optimizationSQL = fs.readFileSync(sqlPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = optimizationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} optimization statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.toLowerCase().includes('create index')) {
        const indexName = extractIndexName(statement);
        console.log(`📊 Creating index ${i + 1}/${statements.length}: ${indexName || 'unnamed'}`);
      } else if (statement.toLowerCase().includes('analyze')) {
        console.log(`📈 Analyzing table statistics: ${statement.split(' ')[1]}`);
      }
      
      try {
        await db.execute(sql.raw(statement + ';'));
      } catch (error: any) {
        // Log but don't fail on individual errors (indexes might already exist)
        if (!error.message.includes('already exists') && !error.message.includes('does not exist')) {
          console.warn(`⚠️  Warning executing statement: ${error.message}`);
        }
      }
    }
    
    console.log('✅ Database optimizations completed successfully!');
    
    // Update statistics for all major tables
    console.log('📊 Updating table statistics for query optimizer...');
    await updateTableStatistics();
    
    console.log('🎉 All performance optimizations applied!');
    
    // Log performance insights
    console.log('\n📈 Performance Optimization Summary:');
    console.log('   • Added indexes for frequently queried columns');
    console.log('   • Created composite indexes for common query patterns');
    console.log('   • Added partial indexes for filtered queries');
    console.log('   • Updated table statistics for better query planning');
    console.log('   • Optimized authentication and dashboard queries');
    console.log('   • Added full-text search indexes for customer/product search');
    
  } catch (error) {
    console.error('❌ Error applying database optimizations:', error);
    throw error;
  }
}

/**
 * Extract index name from CREATE INDEX statement
 */
function extractIndexName(statement: string): string | null {
  const match = statement.match(/CREATE INDEX(?:\s+CONCURRENTLY)?\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
  return match ? match[1] : null;
}

/**
 * Update table statistics for better query planning
 */
async function updateTableStatistics() {
  const tables = [
    'invoices', 'expenses', 'customers', 'products', 'bank_accounts',
    'estimates', 'company_users', 'user_sessions', 'chart_of_accounts',
    'audit_logs', 'sales_leads', 'ai_conversations', 'ai_messages',
    'companies', 'users', 'suppliers'
  ];
  
  for (const table of tables) {
    try {
      console.log(`   Analyzing ${table}...`);
      await db.execute(sql.raw(`ANALYZE ${table}`));
    } catch (error: any) {
      if (!error.message.includes('does not exist')) {
        console.warn(`   Warning analyzing ${table}: ${error.message}`);
      }
    }
  }
}

/**
 * Performance monitoring query to check slow queries
 */
export async function getSlowQueries(limit: number = 10) {
  try {
    const result = await db.execute(sql`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        stddev_time,
        rows
      FROM pg_stat_statements 
      ORDER BY mean_time DESC 
      LIMIT ${limit}
    `);
    
    return result.rows;
  } catch (error) {
    console.log('pg_stat_statements extension not available for slow query monitoring');
    return [];
  }
}

/**
 * Get database performance metrics
 */
export async function getDatabaseMetrics() {
  try {
    const metrics = await db.execute(sql`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public' 
      AND tablename IN ('invoices', 'expenses', 'customers', 'products', 'companies')
      ORDER BY tablename, attname
    `);
    
    return metrics.rows;
  } catch (error) {
    console.error('Error getting database metrics:', error);
    return [];
  }
}

// Auto-run optimizations if this file is executed directly
if (require.main === module) {
  applyDatabaseOptimizations()
    .then(() => {
      console.log('✅ Optimization script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Optimization script failed:', error);
      process.exit(1);
    });
}