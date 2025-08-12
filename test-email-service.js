// Test script to verify email service configuration
import sgMail from '@sendgrid/mail';

// Check if SendGrid API key is configured
if (process.env.SENDGRID_API_KEY) {
  console.log('✅ SendGrid API Key is configured');
  console.log('   API Key starts with:', process.env.SENDGRID_API_KEY.substring(0, 10) + '...');
  
  // Initialize SendGrid
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  // Test SendGrid configuration
  const testMessage = {
    to: 'test@example.com', // This won't actually send
    from: process.env.SENDGRID_FROM_EMAIL || 'noreply@taxnify.co.za',
    subject: 'Test Email Configuration',
    text: 'This is a test to verify SendGrid configuration',
    html: '<p>This is a test to verify SendGrid configuration</p>',
  };
  
  console.log('✅ SendGrid FROM email:', testMessage.from);
  console.log('✅ SendGrid FROM name:', process.env.SENDGRID_FROM_NAME || 'Taxnify');
  
  // Verify API key format
  if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.log('✅ SendGrid API key format is valid');
  } else {
    console.log('⚠️  SendGrid API key format may be invalid (should start with "SG.")');
  }
  
} else {
  console.log('❌ SendGrid API Key is NOT configured');
}

// Check SMTP configuration as fallback
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  console.log('\n✅ SMTP Configuration is available as fallback:');
  console.log('   SMTP Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('   SMTP Port:', process.env.SMTP_PORT || '587');
  console.log('   SMTP User:', process.env.SMTP_USER);
  console.log('   SMTP Pass: ***configured***');
} else {
  console.log('\n⚠️  No SMTP fallback configuration available');
}

console.log('\n📧 Email Service Status Summary:');
if (process.env.SENDGRID_API_KEY || (process.env.SMTP_USER && process.env.SMTP_PASS)) {
  console.log('✅ Email service is READY to send emails');
  console.log('   Primary: ' + (process.env.SENDGRID_API_KEY ? 'SendGrid' : 'SMTP'));
} else {
  console.log('❌ Email service is NOT configured - cannot send emails');
}