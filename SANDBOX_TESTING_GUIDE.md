# Taxnify Sandbox Testing Guide

## Overview
All integrations are configured to use sandbox/testing environments by default for safe testing before going live.

## 1. Stitch Banking Integration (Sandbox Mode)

### Current Configuration
- **Environment**: SANDBOX (Default)
- **Base URL**: https://api.stitch.money
- **Test Mode**: Enabled

### Test Credentials
To test Stitch integration in sandbox:
1. Go to **Settings > Integrations > Banking**
2. The system is pre-configured for sandbox testing
3. Use Stitch's test credentials (obtainable from https://stitch.money/docs/getting-started)

### Test Bank Accounts
When linking accounts in sandbox mode, you can use Stitch's test bank credentials:
- **Test Bank**: Any South African bank
- **Username**: Use test credentials from Stitch documentation
- **Password**: Use test credentials from Stitch documentation

### Features Available in Sandbox
- ✅ Link test bank accounts
- ✅ Import mock transactions
- ✅ Test reconciliation workflows
- ✅ Simulate payment initiation
- ✅ Test webhook notifications

## 2. SARS eFiling Integration (Sandbox Mode)

### Current Configuration
- **Environment**: SANDBOX (Default)
- **Test Mode**: Enabled by default
- **API URL**: Configured for SARS testing environment

### Test Setup
1. Go to **Settings > Integrations > SARS**
2. Default configuration is set to sandbox
3. Test Mode checkbox is enabled by default

### Test Tax Numbers
For sandbox testing, you can use:
- **Test Tax Number**: 0000000000 (ten zeros)
- **Test Trading Name**: TEST COMPANY PTY LTD
- **Test Practitioner Number**: PR000000

### Sandbox Capabilities
- ✅ VAT201 return testing
- ✅ EMP201/501 payroll testing
- ✅ ITR12/ITR14 income tax testing
- ✅ Provisional tax calculations
- ✅ Simulated submissions (no real filing)
- ✅ Test compliance reports

### Important Notes
- All submissions in sandbox mode are simulated
- No actual returns are filed to SARS
- Perfect for training and testing workflows

## 3. Banking Providers (Sandbox Mode)

### Supported Test Providers

#### Bank Zero
- **Environment**: SANDBOX (Default)
- **Test API Key**: Use Bank Zero sandbox credentials
- **Test Account**: Simulated business account

#### Yodlee
- **Environment**: SANDBOX (Default)
- **API URL**: https://sandbox.api.yodlee.com/ysl
- **Test Credentials**: Available from Yodlee developer portal

### General Banking Features in Sandbox
- ✅ Account balance checking
- ✅ Transaction history import
- ✅ Categorization testing
- ✅ Reconciliation workflows
- ✅ Statement upload testing

## 4. Payment Gateways (Test Mode)

### PayFast
- **Test Mode**: Configured
- **Merchant ID**: 10000100 (sandbox)
- **Merchant Key**: 46f0cd694581a (sandbox)

### Stripe
- **Test Mode**: Use test API keys starting with `sk_test_`
- **Test Cards**: 4242 4242 4242 4242 (successful payment)

## How to Switch Between Environments

### For All Integrations
1. Navigate to **Settings > Integrations**
2. Select the integration you want to configure
3. Look for the **Environment** dropdown
4. Options available:
   - **Sandbox** (Testing) - Default
   - **Production** (Live) - Requires real credentials

### Safety Features
- System defaults to sandbox mode for all new setups
- Clear visual indicators show current environment
- Warning messages before switching to production
- Credentials are encrypted and stored securely

## Testing Workflows

### 1. Banking Integration Test
```
1. Go to Banking > Link Account
2. Select your test bank
3. Use Stitch sandbox credentials
4. Verify test transactions appear
5. Test reconciliation with dummy data
```

### 2. SARS Integration Test
```
1. Go to SARS > VAT Returns
2. Create a test VAT201 return
3. Review calculated values
4. Submit (simulated - no real filing)
5. Check status updates
```

### 3. Payment Processing Test
```
1. Create a test invoice
2. Process payment with test card
3. Verify payment status updates
4. Check transaction records
```

## Best Practices

1. **Always Start in Sandbox**: Test all workflows in sandbox before production
2. **Document Test Cases**: Keep records of test scenarios
3. **Verify Data Flow**: Ensure data moves correctly through the system
4. **Test Error Handling**: Deliberately cause errors to test system responses
5. **Train Users**: Use sandbox for staff training without risk

## Troubleshooting

### Common Issues

#### "Connection Failed" Error
- Verify internet connectivity
- Check if sandbox services are operational
- Ensure credentials are correctly entered

#### "Invalid Credentials" Error
- Confirm you're using sandbox credentials, not production
- Check for typos in API keys
- Verify environment is set to sandbox

#### No Test Data Appearing
- Allow time for sync (usually 1-2 minutes)
- Check date ranges in filters
- Verify sandbox mode is active

## Support

For sandbox testing support:
- Check integration provider documentation
- Review error logs in Settings > System Logs
- Contact support with sandbox-specific questions

## Security Notes

- Sandbox credentials are separate from production
- No real financial data is processed in sandbox
- Test data is automatically cleared periodically
- Safe for training and demonstration purposes

---

**Remember**: Sandbox mode is your safe testing environment. Use it extensively before switching to production!