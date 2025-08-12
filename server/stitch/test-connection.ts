/**
 * Test Stitch Connection
 * Verifies that Stitch credentials are working properly
 */

import { StitchGraphQLClient } from './client.js';

export async function testStitchConnection() {
  console.log('🔍 Testing Stitch Connection...');
  console.log('================================');
  
  const client = new StitchGraphQLClient();
  
  // Check if we have credentials
  const hasCredentials = process.env.STITCH_CLIENT_ID && 
                         process.env.STITCH_CLIENT_SECRET;
  
  if (!hasCredentials) {
    console.log('❌ No Stitch credentials found');
    console.log('   Running in DEMO mode');
    return {
      status: 'demo',
      message: 'No credentials - running in demo mode'
    };
  }
  
  console.log('✅ Stitch credentials detected:');
  console.log(`   Client ID: ${process.env.STITCH_CLIENT_ID?.substring(0, 10)}...`);
  console.log(`   Environment: ${process.env.STITCH_ENV || 'sandbox'}`);
  
  try {
    // Test getting an access token
    const token = await client.getAccessToken();
    
    if (token) {
      console.log('✅ Successfully authenticated with Stitch!');
      console.log('   Access token obtained');
      console.log('   Integration is LIVE and ready');
      
      return {
        status: 'live',
        message: 'Successfully connected to Stitch',
        environment: process.env.STITCH_ENV || 'sandbox',
        clientId: process.env.STITCH_CLIENT_ID?.substring(0, 10) + '...'
      };
    } else {
      console.log('⚠️ Authentication failed - check credentials');
      return {
        status: 'error',
        message: 'Failed to authenticate with Stitch'
      };
    }
  } catch (error: any) {
    console.error('❌ Error testing Stitch connection:', error.message);
    return {
      status: 'error',
      message: error.message || 'Failed to connect to Stitch'
    };
  }
}

// Run test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testStitchConnection().then(result => {
    console.log('\n📊 Test Result:', result);
  });
}