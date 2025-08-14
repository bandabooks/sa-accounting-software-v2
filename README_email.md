# Email Service Configuration & Troubleshooting Guide

## Overview

The Taxnify email service supports both SendGrid (recommended for production) and SMTP providers. This guide covers configuration, common issues, and troubleshooting steps.

## Configuration

### SendGrid (Recommended)

1. **Set Environment Variables**:
   ```bash
   SENDGRID_API_KEY=your_api_key_here
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=Your Company Name
   ```

2. **Verify Sender Identity**:
   - Log into SendGrid Dashboard
   - Navigate to Settings → Sender Authentication
   - Add and verify your sender email domain or single sender
   - The sender email MUST match `SENDGRID_FROM_EMAIL`

3. **API Key Permissions**:
   - Ensure your API key has "Mail Send" permission
   - Full Access keys work but are not recommended for production

### SMTP Configuration

1. **Set Environment Variables**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   ```

2. **Gmail Specific**:
   - Enable 2-factor authentication
   - Generate an App Password (not your regular password)
   - Use the App Password for `SMTP_PASS`

## Troubleshooting

### Common Error Messages & Solutions

#### 403 Forbidden: "The from address does not match a verified Sender Identity"

**Problem**: SendGrid requires sender verification
**Solution**: 
1. Verify your sender domain or email in SendGrid dashboard
2. Ensure `SENDGRID_FROM_EMAIL` matches the verified sender
3. Wait 5-10 minutes for verification to propagate

#### 403 Forbidden: "Invalid API key"

**Problem**: SendGrid API key is incorrect or has wrong permissions
**Solution**:
1. Check API key is correctly copied (no extra spaces)
2. Verify key has "Mail Send" permission in SendGrid
3. Regenerate key if necessary

#### 401 Authentication Failed

**Problem**: SMTP credentials are incorrect
**Solution**:
1. For Gmail: Use App Password, not regular password
2. Check username is full email address
3. Verify account allows "less secure apps" or use OAuth2

#### 503 Could not connect to email server

**Problem**: SMTP server connection failed
**Solution**:
1. Check firewall/network allows outbound connections on SMTP port
2. Verify SMTP_HOST and SMTP_PORT are correct
3. Try alternative ports (465 for SSL, 587 for TLS, 25 for unencrypted)

#### 400 Unverified sender email

**Problem**: Trying to send from an unverified email address
**Solution**:
1. Use the default verified sender (noreply@taxnify.co.za)
2. Or add and verify your custom sender in SendGrid

### Health Check API

Use the health check endpoint to diagnose configuration issues:

```bash
curl http://localhost:5000/api/email/health \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Response shows:
- `ok`: Whether email service is ready
- `provider`: Which provider is configured (sendgrid/smtp/none)
- `hasKey`: Whether API key/credentials are set
- `hasFrom`: Whether sender email is configured
- `verifiedSender`: Whether sender is verified
- `details.errorHint`: Specific issue to fix

### Environment Variable Reload

After changing environment variables:
1. Restart the application server
2. Check `/api/email/health` to verify new configuration
3. Send a test email to confirm

### Testing Email Delivery

1. Navigate to Company → Email Settings
2. Enter your email address in Test Email tab
3. Select email type (Welcome, Invoice, etc.)
4. Click "Send Test Email"
5. Check for specific error messages in the toast notification

### SendGrid Dashboard Checks

1. **API Keys**: Settings → API Keys
   - Verify key exists and has correct permissions
   
2. **Sender Authentication**: Settings → Sender Authentication
   - Check domain or single sender is verified
   - Status should show "Verified"
   
3. **Activity Feed**: Activity → Activity Feed
   - Check for bounced or blocked emails
   - Review error details for failed sends

### Debug Mode

For development debugging, check server logs:
```bash
# Server logs show:
# - Provider being used
# - Sender email address
# - Detailed error messages (development mode only)
```

## Best Practices

1. **Production**:
   - Always use SendGrid for production
   - Verify domain (not just single sender) for better deliverability
   - Monitor SendGrid activity feed for issues

2. **Development**:
   - SMTP with Gmail App Password works well
   - Use test email addresses to avoid spam issues
   - Keep test volume low to avoid rate limits

3. **Security**:
   - Never commit API keys to version control
   - Use environment variables for all credentials
   - Rotate API keys periodically
   - Limit API key permissions to only what's needed

## Support

For additional help:
1. Check SendGrid Status: https://status.sendgrid.com/
2. SendGrid Documentation: https://docs.sendgrid.com/
3. Contact system administrator for credential issues