# Sandbox to Production Switch Guide

## Quick Overview
After testing is complete, you can switch each integration from sandbox to production mode. Here are the exact locations to make these changes.

---

## 1. 🏦 **Stitch Banking Integration**

### Where to Change:
**Location:** Settings > Integrations > Banking Integration

### Steps to Switch:
1. Navigate to **Settings > Integrations**
2. Click on **Banking Integration** 
3. Find the **Environment** dropdown
4. Change from `Sandbox (Testing)` to `Production (Live)`
5. Enter your production credentials:
   - Production Client ID (from Stitch)
   - Production Client Secret (from Stitch)
   - Production Webhook Secret (from Stitch)
6. Click **Save Banking Settings**

### What Changes:
- API URL: Remains `https://api.stitch.money` (same for both)
- Credentials: Must use production keys from Stitch
- Transactions: Real bank accounts and live data

### Required Before Switching:
- ✅ Production credentials from Stitch
- ✅ Verified business account with Stitch
- ✅ Completed testing in sandbox

---

## 2. 🏛️ **SARS eFiling Integration**

### Where to Change:
**Location:** Settings > Integrations > SARS Integration

### Steps to Switch:
1. Navigate to **Settings > Integrations**
2. Click on **SARS Integration**
3. Find the **Environment** dropdown
4. Change from `Sandbox (Testing)` to `Production (Live)`
5. Uncheck the **Test Mode** checkbox
6. Enter your production credentials:
   - SARS API Key (from SARS vendor registration)
   - Client Secret
   - Client ID
   - Vendor ID
7. Click **Save SARS Settings**

### What Changes:
- API URL: Production SARS eFiling endpoint
- Submissions: Real tax returns filed to SARS
- Test Mode: Must be disabled for production

### Required Before Switching:
- ✅ SARS vendor registration approved
- ✅ Production API credentials from SARS
- ✅ Tax practitioner number (if applicable)

---

## 3. 🏢 **CIPC Integration**

### Where to Change:
**Location:** Settings > Integrations > CIPC Integration

### Steps to Switch:
1. Navigate to **Settings > Integrations**
2. Click on **CIPC Integration**
3. Find the **Environment** dropdown
4. Change from `Sandbox (Testing)` to `Production (Live)`
5. Enter your production credentials:
   - CIPC Customer Code
   - CIPC API Key
   - CIPC Username
   - CIPC Password
6. Click **Save CIPC Settings**

### What Changes:
- API Endpoint: Production CIPC services
- Company searches: Real business data
- Document retrieval: Official CIPC documents

### Required Before Switching:
- ✅ CIPC customer account
- ✅ Production API access approved
- ✅ Valid customer code

---

## 4. 💳 **Payment Gateways**

### PayFast
**Location:** Settings > Integrations > PayFast

### Steps to Switch:
1. Navigate to **Settings > Integrations**
2. Click on **PayFast**
3. Enter production credentials:
   - Production Merchant ID
   - Production Merchant Key  
   - Production Passphrase
4. The system automatically detects production mode based on credentials
5. Click **Save PayFast Settings**

### Stripe
**Location:** Settings > Integrations > Stripe

### Steps to Switch:
1. Navigate to **Settings > Integrations**
2. Click on **Stripe**
3. Replace test keys with production:
   - Change `sk_test_...` to `sk_live_...`
   - Change `pk_test_...` to `pk_live_...`
4. Click **Save Stripe Settings**

---

## 5. 📧 **Communication Services**

### SendGrid Email
**Location:** Settings > Integrations > SendGrid

- Already uses production API keys
- No sandbox/production switch needed
- Just ensure you have verified sender domain

### Twilio SMS
**Location:** Settings > Integrations > Twilio

- Already uses production credentials
- No sandbox/production switch needed
- Ensure phone numbers are verified

---

## 🔄 **Environment Variables (Technical)**

If you have server access, you can also update these environment variables:

```bash
# In your .env file, change these:

# Stitch Banking
STITCH_ENV=production  # Change from 'sandbox'
STITCH_CLIENT_ID=your_production_client_id
STITCH_CLIENT_SECRET=your_production_client_secret

# SARS Integration
SARS_ENVIRONMENT=production  # Change from 'sandbox'
SARS_CLIENT_ID=your_production_client_id
SARS_CLIENT_SECRET=your_production_client_secret

# CIPC Integration  
CIPC_ENVIRONMENT=production  # Change from 'sandbox'
CIPC_API_KEY=your_production_api_key

# Global Setting
INTEGRATION_MODE=production  # Change from 'sandbox'
```

---

## ⚠️ **Important Safety Checks**

### Before Switching to Production:

1. **Complete Testing Phase**
   - ✅ Test all workflows in sandbox
   - ✅ Verify data flows correctly
   - ✅ Train all staff members
   - ✅ Document any issues found

2. **Verify Credentials**
   - ✅ Have all production API keys ready
   - ✅ Ensure accounts are verified
   - ✅ Check API limits and quotas

3. **Backup Data**
   - ✅ Export any test data you want to keep
   - ✅ Clear test transactions if needed
   - ✅ Document your test scenarios

4. **Gradual Rollout**
   - Consider switching one integration at a time
   - Start with less critical services
   - Monitor each integration after switching

---

## 🚀 **Quick Switch Checklist**

Use this checklist when ready to go live:

### Stitch Banking
- [ ] Have production credentials from Stitch
- [ ] Business account verified with Stitch
- [ ] Test bank connections successful
- [ ] Switch environment to Production
- [ ] Enter production credentials
- [ ] Test with small transaction first

### SARS eFiling
- [ ] SARS vendor registration complete
- [ ] Have production API credentials
- [ ] All test returns successful
- [ ] Switch environment to Production
- [ ] Disable Test Mode checkbox
- [ ] Verify with status check

### CIPC
- [ ] CIPC customer account active
- [ ] Have production credentials
- [ ] Test searches successful
- [ ] Switch environment to Production
- [ ] Enter production credentials
- [ ] Verify with company search

### Payment Gateways
- [ ] Merchant accounts approved
- [ ] Have production API keys
- [ ] Test payments successful
- [ ] Replace test keys with production
- [ ] Process small test payment
- [ ] Verify in gateway dashboard

---

## 📞 **Support Contacts**

If you need help with production credentials:

- **Stitch Support:** https://stitch.money/support
- **SARS eFiling:** Contact your SARS relationship manager
- **CIPC Support:** https://www.cipc.co.za/contact-us
- **PayFast Support:** https://www.payfast.co.za/contact
- **Stripe Support:** https://support.stripe.com

---

## 🔒 **Security Reminder**

- Never share production credentials
- Use secure channels for credential exchange
- Enable 2FA where available
- Monitor API usage regularly
- Set up webhook notifications
- Review security logs weekly

---

**Remember:** You can switch each integration independently. There's no need to switch everything at once. Start with what you need most and gradually move others to production as you obtain credentials.