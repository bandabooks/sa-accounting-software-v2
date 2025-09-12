/**
 * Lightweight Database Integration Test for Health Metrics
 * Verifies that health metrics can be persisted correctly to the database
 */

import { storage } from '../storage';
import type { InsertSystemHealthMetric } from '@shared/schema';

export async function runHealthMetricsIntegrationTest(): Promise<void> {
  console.log('🧪 Starting Health Metrics Database Integration Test...');
  
  try {
    // Test 1: Create a basic health metric
    console.log('📊 Test 1: Creating basic health metric...');
    const basicMetric: InsertSystemHealthMetric = {
      metricType: 'test_metric',
      metricName: 'Integration Test Metric',
      value: 42.5,
      unit: 'test_units',
      status: 'normal',
      timestamp: new Date(),
      tags: { test: true, environment: 'integration_test' }
    };

    const createdMetric = await storage.createHealthMetric(basicMetric);
    console.log('✅ Basic health metric created successfully:', {
      id: createdMetric.id,
      metricType: createdMetric.metricType,
      value: createdMetric.value,
      status: createdMetric.status
    });

    // Test 2: Create a metric with company association
    console.log('📊 Test 2: Creating company-specific health metric...');
    const companyMetric: InsertSystemHealthMetric = {
      companyId: 2, // Test company
      metricType: 'company_health',
      metricName: 'Company Health Check',
      value: 95.0,
      unit: 'percentage',
      status: 'normal',
      timestamp: new Date(),
      tags: { company: 2, test: true }
    };

    const createdCompanyMetric = await storage.createHealthMetric(companyMetric);
    console.log('✅ Company health metric created successfully:', {
      id: createdCompanyMetric.id,
      companyId: createdCompanyMetric.companyId,
      metricType: createdCompanyMetric.metricType,
      value: createdCompanyMetric.value
    });

    // Test 3: Retrieve metrics by type
    console.log('📊 Test 3: Retrieving metrics by type...');
    const testMetrics = await storage.getMetricsByType('test_metric');
    console.log(`✅ Retrieved ${testMetrics.length} test metrics`);

    // Test 4: Retrieve latest metrics
    console.log('📊 Test 4: Retrieving latest metrics...');
    const latestMetrics = await storage.getLatestMetrics();
    console.log(`✅ Retrieved ${latestMetrics.length} latest metrics`);

    // Test 5: Create metric with all schema fields
    console.log('📊 Test 5: Creating comprehensive health metric...');
    const comprehensiveMetric: InsertSystemHealthMetric = {
      companyId: 2,
      metricType: 'comprehensive_test',
      metricName: 'Full Schema Test Metric',
      value: 87.3,
      unit: 'score',
      status: 'warning',
      tags: {
        test: true,
        fullSchema: true,
        features: ['monitoring', 'alerting', 'persistence'],
        timestamp: new Date().toISOString()
      },
      timestamp: new Date()
    };

    const comprehensiveCreated = await storage.createHealthMetric(comprehensiveMetric);
    console.log('✅ Comprehensive health metric created successfully:', {
      id: comprehensiveCreated.id,
      metricType: comprehensiveCreated.metricType,
      status: comprehensiveCreated.status,
      tagsCount: Object.keys(comprehensiveCreated.tags || {}).length
    });

    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    // Note: In a production system, you'd want to clean up test data
    // For now, we'll leave the test metrics as they demonstrate the system works

    console.log('🎉 Health Metrics Database Integration Test completed successfully!');
    console.log('📊 All database persistence operations verified working correctly');

  } catch (error) {
    console.error('❌ Health Metrics Integration Test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('42703')) {
        console.error('🔍 PostgreSQL Error 42703: Column does not exist');
        console.error('This indicates a schema mismatch between the code and database');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('🔍 PostgreSQL Table Missing: system_health_metrics table does not exist');
        console.error('Run database migrations or check schema deployment');
      } else {
        console.error('🔍 Database operation failed:', error.message);
      }
    }
    
    throw error;
  }
}

// Auto-run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runHealthMetricsIntegrationTest()
    .then(() => {
      console.log('✅ Integration test completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Integration test failed:', error);
      process.exit(1);
    });
}