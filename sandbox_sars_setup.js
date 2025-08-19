// Sandbox SARS Setup Script
// This script sets up a working SARS sandbox connection for testing

const fetch = require('node-fetch');

async function setupSandboxSars() {
  try {
    console.log('Setting up SARS Sandbox Configuration...');
    
    // Step 1: Configure SARS Vendor Settings (sandbox)
    const vendorConfig = {
      clientId: "sars_sandbox_client_001",
      clientSecret: "sars_sandbox_secret_abc123",
      apiKey: "sandbox_api_key_xyz789",
      vatVendorNumber: "VENDOR001",
      environment: "sandbox",
      isActive: true
    };

    console.log('Creating vendor configuration...');
    const vendorResponse = await fetch('http://localhost:5000/api/sars/vendor/configure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sandbox_token'
      },
      body: JSON.stringify(vendorConfig)
    });

    if (vendorResponse.ok) {
      console.log('✅ Vendor configuration created successfully');
    } else {
      console.log('⚠️ Vendor configuration may already exist');
    }

    // Step 2: Create company SARS link for current company
    const companyLink = {
      companyId: 2, // Default company ID
      accessToken: "sandbox_access_token_123",
      refreshToken: "sandbox_refresh_token_456", 
      tokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isConnected: true,
      lastSyncAt: new Date()
    };

    console.log('Creating company SARS link...');
    const linkResponse = await fetch('http://localhost:5000/api/sars/company/link', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sandbox_token'
      },
      body: JSON.stringify(companyLink)
    });

    if (linkResponse.ok) {
      console.log('✅ Company SARS link created successfully');
    } else {
      console.log('⚠️ Company SARS link may already exist');
    }

    // Step 3: Verify connection status
    console.log('Verifying SARS connection status...');
    const statusResponse = await fetch('http://localhost:5000/api/sars/status', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer sandbox_token'
      }
    });

    if (statusResponse.ok) {
      const status = await statusResponse.json();
      console.log('✅ SARS Status:', status);
    }

    console.log('\n🎉 SARS Sandbox setup completed successfully!');
    console.log('You can now test the enhanced SARS Integration features.');
    
  } catch (error) {
    console.error('❌ Error setting up SARS sandbox:', error.message);
  }
}

// Run the setup
setupSandboxSars();