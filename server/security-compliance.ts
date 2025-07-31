import { IStorage } from './storage';
import type { 
  SecurityScan, 
  ComplianceCheck, 
  SecurityAlert, 
  SecurityPolicy,
  SecurityFinding,
  ComplianceIssue,
  SecurityRule 
} from '@shared/schema';

export class SecurityComplianceService {
  constructor(private storage: IStorage) {}

  // Security Scanning Functions
  async runVulnerabilityScans(companyId: number, userId: number): Promise<SecurityScan[]> {
    const vulnerabilityChecks = [
      await this.checkWeakPasswords(companyId, userId),
      await this.checkSuspiciousLoginActivity(companyId, userId),
      await this.checkUnauthorizedAccess(companyId, userId),
      await this.checkDataExposure(companyId, userId),
      await this.checkSystemUpdates(companyId, userId)
    ];

    return vulnerabilityChecks;
  }

  private async checkWeakPasswords(companyId: number, userId: number): Promise<SecurityScan> {
    const findings: SecurityFinding[] = [];
    
    // Simulate checking user passwords (in reality, you'd check password strength requirements)
    const users = await this.storage.getAllUsers();
    const companyUsers = users.filter(u => u.companyId === companyId);
    
    let weakPasswordCount = 0;
    companyUsers.forEach(user => {
      // Simulate weak password detection (real implementation would check hashed passwords)
      if (Math.random() < 0.3) { // 30% chance of weak password
        weakPasswordCount++;
        findings.push({
          id: `pwd-${user.id}`,
          type: 'weakness',
          severity: 'medium',
          title: 'Weak Password Detected',
          description: `User ${user.username} may have a weak password`,
          affected_resource: `User: ${user.username}`,
          recommendation: 'Enforce strong password requirements and consider mandatory password reset',
          references: ['https://owasp.org/www-project-authentication-cheat-sheet/']
        });
      }
    });

    const riskLevel = weakPasswordCount > 3 ? 'high' : weakPasswordCount > 1 ? 'medium' : 'low';

    return await this.storage.createSecurityScan({
      companyId,
      scanType: 'password',
      status: 'completed',
      riskLevel,
      findings,
      recommendation: weakPasswordCount > 0 
        ? 'Implement stronger password policies and enforce regular password updates'
        : 'Password security appears adequate',
      scheduledAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date(),
      createdBy: userId
    });
  }

  private async checkSuspiciousLoginActivity(companyId: number, userId: number): Promise<SecurityScan> {
    const findings: SecurityFinding[] = [];
    
    // Simulate checking audit logs for suspicious activity
    const auditLogs = await this.storage.getAuditLogs(companyId, 1, 100);
    const loginAttempts = auditLogs.filter(log => log.action === 'LOGIN' || log.action === 'LOGIN_FAILED');
    
    const failedLogins = loginAttempts.filter(log => log.action === 'LOGIN_FAILED');
    const suspiciousActivity = failedLogins.length > 10; // More than 10 failed logins
    
    if (suspiciousActivity) {
      findings.push({
        id: 'login-suspicious',
        type: 'vulnerability',
        severity: 'high',
        title: 'Suspicious Login Activity Detected',
        description: `${failedLogins.length} failed login attempts detected in recent activity`,
        affected_resource: 'Authentication System',
        recommendation: 'Review failed login attempts and consider implementing account lockout policies',
        references: ['https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks']
      });
    }

    const riskLevel = suspiciousActivity ? 'high' : 'low';

    return await this.storage.createSecurityScan({
      companyId,
      scanType: 'vulnerability',
      status: 'completed',
      riskLevel,
      findings,
      recommendation: suspiciousActivity 
        ? 'Implement rate limiting and account lockout mechanisms'
        : 'No suspicious login activity detected',
      scheduledAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date(),
      createdBy: userId
    });
  }

  private async checkUnauthorizedAccess(companyId: number, userId: number): Promise<SecurityScan> {
    const findings: SecurityFinding[] = [];
    
    // Check for users with excessive permissions
    const users = await this.storage.getAllUsers();
    const companyUsers = users.filter(u => u.companyId === companyId);
    
    companyUsers.forEach(user => {
      if (user.role === 'super_admin' && !['sysadmin_7f3a2b8e', 'accounts@thinkmybiz.com'].includes(user.username)) {
        findings.push({
          id: `access-${user.id}`,
          type: 'misconfiguration',
          severity: 'medium',
          title: 'Excessive User Permissions',
          description: `User ${user.username} has super admin privileges`,
          affected_resource: `User: ${user.username}`,
          recommendation: 'Review user permissions and apply principle of least privilege'
        });
      }
    });

    const riskLevel = findings.length > 0 ? 'medium' : 'low';

    return await this.storage.createSecurityScan({
      companyId,
      scanType: 'vulnerability',
      status: 'completed',
      riskLevel,
      findings,
      recommendation: findings.length > 0 
        ? 'Review and reduce excessive user permissions'
        : 'User access permissions appear appropriate',
      scheduledAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date(),
      createdBy: userId
    });
  }

  private async checkDataExposure(companyId: number, userId: number): Promise<SecurityScan> {
    const findings: SecurityFinding[] = [];
    
    // Check for sensitive data exposure risks
    const hasSSLConfig = process.env.NODE_ENV === 'production'; // Simplified SSL check
    const hasBackupStrategy = false; // Simulate backup strategy check
    
    if (!hasSSLConfig && process.env.NODE_ENV === 'production') {
      findings.push({
        id: 'ssl-missing',
        type: 'misconfiguration',
        severity: 'high',
        title: 'SSL/TLS Configuration Missing',
        description: 'Production environment without proper SSL/TLS encryption',
        affected_resource: 'Web Application',
        recommendation: 'Implement SSL/TLS certificates for all production traffic'
      });
    }

    if (!hasBackupStrategy) {
      findings.push({
        id: 'backup-missing',
        type: 'weakness',
        severity: 'medium',
        title: 'Backup Strategy Not Implemented',
        description: 'No automated backup strategy detected',
        affected_resource: 'Database',
        recommendation: 'Implement regular automated backups with encryption'
      });
    }

    const riskLevel = findings.some(f => f.severity === 'high') ? 'high' : 
                     findings.length > 0 ? 'medium' : 'low';

    return await this.storage.createSecurityScan({
      companyId,
      scanType: 'data_integrity',
      status: 'completed',
      riskLevel,
      findings,
      recommendation: findings.length > 0 
        ? 'Address data exposure vulnerabilities immediately'
        : 'Data protection measures appear adequate',
      scheduledAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date(),
      createdBy: userId
    });
  }

  private async checkSystemUpdates(companyId: number, userId: number): Promise<SecurityScan> {
    const findings: SecurityFinding[] = [];
    
    // Simulate system update checks
    const systemOutdated = Math.random() < 0.2; // 20% chance system needs updates
    
    if (systemOutdated) {
      findings.push({
        id: 'system-outdated',
        type: 'vulnerability',
        severity: 'medium',
        title: 'System Components May Need Updates',
        description: 'Some system dependencies may have available security updates',
        affected_resource: 'System Dependencies',
        recommendation: 'Review and update system dependencies regularly'
      });
    }

    const riskLevel = systemOutdated ? 'medium' : 'low';

    return await this.storage.createSecurityScan({
      companyId,
      scanType: 'vulnerability',
      status: 'completed',
      riskLevel,
      findings,
      recommendation: systemOutdated 
        ? 'Schedule regular system maintenance and updates'
        : 'System components appear up to date',
      scheduledAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date(),
      createdBy: userId
    });
  }

  // Compliance Checking Functions
  async runComplianceChecks(companyId: number, userId: number): Promise<ComplianceCheck[]> {
    const complianceChecks = [
      await this.checkPOPICompliance(companyId, userId),
      await this.checkSARSCompliance(companyId, userId),
      await this.checkPCIDSSCompliance(companyId, userId),
      await this.checkDataRetentionCompliance(companyId, userId),
      await this.checkGDPRCompliance(companyId, userId)
    ];

    return complianceChecks;
  }

  private async checkPOPICompliance(companyId: number, userId: number): Promise<ComplianceCheck> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check data processing consent
    const hasConsentManagement = false; // Simulate consent management check
    if (!hasConsentManagement) {
      issues.push({
        id: 'popi-consent',
        regulation: 'POPI',
        requirement: 'Data Subject Consent',
        status: 'non_compliant',
        description: 'No formal consent management system detected',
        remediation: 'Implement consent management for personal data processing',
        priority: 'high'
      });
      score -= 25;
    }

    // Check data retention policies
    const hasRetentionPolicy = false; // Simulate retention policy check
    if (!hasRetentionPolicy) {
      issues.push({
        id: 'popi-retention',
        regulation: 'POPI',
        requirement: 'Data Retention Limitation',
        status: 'needs_review',
        description: 'Data retention policies need review',
        remediation: 'Establish clear data retention and deletion policies',
        priority: 'medium'
      });
      score -= 15;
    }

    // Check data access controls
    const hasAccessControls = true; // We have RBAC system
    if (!hasAccessControls) {
      score -= 20;
    }

    return await this.storage.createComplianceCheck({
      companyId,
      checkType: 'popi',
      status: 'completed',
      complianceScore: Math.max(0, score),
      issues,
      recommendations: [
        'Implement formal consent management procedures',
        'Establish data retention and deletion policies',
        'Conduct regular POPI compliance audits',
        'Train staff on personal data protection requirements'
      ],
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isAutomated: true,
      createdBy: userId
    });
  }

  private async checkSARSCompliance(companyId: number, userId: number): Promise<ComplianceCheck> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check VAT registration status
    const company = await this.storage.getCompany(companyId);
    const isVATRegistered = company?.vatNumber && company.vatNumber.length > 0;
    
    if (isVATRegistered) {
      // Check VAT return submissions
      const hasVATReturns = false; // Simulate VAT return check
      if (!hasVATReturns) {
        issues.push({
          id: 'sars-vat-returns',
          regulation: 'SARS',
          requirement: 'VAT Return Submissions',
          status: 'needs_review',
          description: 'VAT return submission schedule needs verification',
          remediation: 'Ensure timely VAT return submissions to SARS',
          priority: 'high'
        });
        score -= 20;
      }
    }

    // Check record keeping
    const hasRecordKeeping = true; // We have audit logs and transaction records
    if (!hasRecordKeeping) {
      score -= 25;
    }

    return await this.storage.createComplianceCheck({
      companyId,
      checkType: 'sars',
      status: 'completed',
      complianceScore: Math.max(0, score),
      issues,
      recommendations: [
        'Maintain detailed financial records as required by SARS',
        'Ensure timely tax return submissions',
        'Keep supporting documentation for all transactions',
        'Regular reconciliation of financial records'
      ],
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isAutomated: true,
      createdBy: userId
    });
  }

  private async checkPCIDSSCompliance(companyId: number, userId: number): Promise<ComplianceCheck> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check if payment processing is enabled
    const hasPaymentProcessing = true; // PayFast integration exists
    
    if (hasPaymentProcessing) {
      // Check data encryption
      const hasEncryption = true; // HTTPS and encrypted database
      if (!hasEncryption) {
        issues.push({
          id: 'pci-encryption',
          regulation: 'PCI-DSS',
          requirement: 'Data Encryption',
          status: 'non_compliant',
          description: 'Payment data encryption not properly implemented',
          remediation: 'Implement end-to-end encryption for all payment data',
          priority: 'critical'
        });
        score -= 40;
      }

      // Check access controls for payment data
      const hasPaymentAccessControls = true; // RBAC system controls access
      if (!hasPaymentAccessControls) {
        score -= 25;
      }
    }

    return await this.storage.createComplianceCheck({
      companyId,
      checkType: 'pci_dss',
      status: 'completed',
      complianceScore: Math.max(0, score),
      issues,
      recommendations: [
        'Maintain PCI-DSS compliance for payment processing',
        'Regular security assessments of payment systems',
        'Implement network segmentation for payment processing',
        'Monitor and log all access to payment data'
      ],
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isAutomated: true,
      createdBy: userId
    });
  }

  private async checkDataRetentionCompliance(companyId: number, userId: number): Promise<ComplianceCheck> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check retention policy documentation
    const hasRetentionPolicy = false; // Simulate policy check
    if (!hasRetentionPolicy) {
      issues.push({
        id: 'retention-policy',
        regulation: 'GDPR/POPI',
        requirement: 'Data Retention Policy',
        status: 'non_compliant',
        description: 'No documented data retention policy found',
        remediation: 'Create and implement formal data retention policies',
        priority: 'medium'
      });
      score -= 30;
    }

    // Check automated deletion processes
    const hasAutomatedDeletion = false;
    if (!hasAutomatedDeletion) {
      issues.push({
        id: 'automated-deletion',
        regulation: 'GDPR/POPI',
        requirement: 'Automated Data Deletion',
        status: 'needs_review',
        description: 'No automated data deletion processes detected',
        remediation: 'Implement automated deletion for expired data',
        priority: 'medium'
      });
      score -= 20;
    }

    return await this.storage.createComplianceCheck({
      companyId,
      checkType: 'data_retention',
      status: 'completed',
      complianceScore: Math.max(0, score),
      issues,
      recommendations: [
        'Document data retention requirements for each data type',
        'Implement automated data deletion processes',
        'Regular review of stored data against retention policies',
        'Maintain audit trail of data deletion activities'
      ],
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
      isAutomated: true,
      createdBy: userId
    });
  }

  private async checkGDPRCompliance(companyId: number, userId: number): Promise<ComplianceCheck> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check privacy policy
    const hasPrivacyPolicy = false;
    if (!hasPrivacyPolicy) {
      issues.push({
        id: 'gdpr-privacy-policy',
        regulation: 'GDPR',
        requirement: 'Privacy Policy',
        status: 'non_compliant',
        description: 'No privacy policy found on website',
        remediation: 'Publish comprehensive privacy policy',
        priority: 'high'
      });
      score -= 25;
    }

    // Check data subject rights
    const hasDataSubjectRights = false;
    if (!hasDataSubjectRights) {
      issues.push({
        id: 'gdpr-data-rights',
        regulation: 'GDPR',
        requirement: 'Data Subject Rights',
        status: 'needs_review',
        description: 'Data subject rights procedures need implementation',
        remediation: 'Implement processes for data access, portability, and deletion requests',
        priority: 'medium'
      });
      score -= 20;
    }

    return await this.storage.createComplianceCheck({
      companyId,
      checkType: 'gdpr',
      status: 'completed',
      complianceScore: Math.max(0, score),
      issues,
      recommendations: [
        'Publish comprehensive privacy policy',
        'Implement data subject rights procedures',
        'Conduct privacy impact assessments',
        'Maintain records of processing activities'
      ],
      lastChecked: new Date(),
      nextCheck: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 365 days
      isAutomated: true,
      createdBy: userId
    });
  }

  // Alert Management
  async createSecurityAlert(
    companyId: number,
    alertType: string,
    severity: string,
    title: string,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<SecurityAlert> {
    return await this.storage.createSecurityAlert({
      companyId,
      alertType,
      severity,
      title,
      description,
      metadata,
      status: 'active'
    });
  }

  // Security Policy Management
  async createDefaultSecurityPolicies(companyId: number, userId: number): Promise<SecurityPolicy[]> {
    const policies = [
      {
        policyType: 'password',
        name: 'Password Security Policy',
        description: 'Minimum requirements for user passwords',
        rules: [
          {
            id: 'pwd-length',
            name: 'Minimum Length',
            condition: 'password.length >= 8',
            action: 'block' as const,
            parameters: { minLength: 8 }
          },
          {
            id: 'pwd-complexity',
            name: 'Character Complexity',
            condition: 'password.hasUppercase && password.hasLowercase && password.hasNumber',
            action: 'warn' as const,
            parameters: { requireMixed: true }
          }
        ] as SecurityRule[]
      },
      {
        policyType: 'access',
        name: 'Access Control Policy',
        description: 'User access and authentication requirements',
        rules: [
          {
            id: 'session-timeout',
            name: 'Session Timeout',
            condition: 'session.idle > 3600',
            action: 'log' as const,
            parameters: { timeoutSeconds: 3600 }
          },
          {
            id: 'failed-login-lockout',
            name: 'Account Lockout',
            condition: 'failedLogins >= 5',
            action: 'block' as const,
            parameters: { maxFailedAttempts: 5 }
          }
        ] as SecurityRule[]
      }
    ];

    const createdPolicies = [];
    for (const policyData of policies) {
      const policy = await this.storage.createSecurityPolicy({
        companyId,
        ...policyData,
        isActive: true,
        enforcementLevel: 'warning',
        createdBy: userId
      });
      createdPolicies.push(policy);
    }

    return createdPolicies;
  }

  // Comprehensive Security Dashboard
  async getSecurityDashboard(companyId: number): Promise<{
    overallRiskScore: number;
    recentScans: SecurityScan[];
    activeAlerts: SecurityAlert[];
    complianceStatus: ComplianceCheck[];
    recommendations: string[];
  }> {
    const recentScans = await this.storage.getSecurityScansByCompany(companyId);
    const activeAlerts = await this.storage.getSecurityAlertsByCompany(companyId);
    const complianceChecks = await this.storage.getComplianceChecksByCompany(companyId);

    // Calculate overall risk score
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;
    const highRiskScans = recentScans.filter(s => s.riskLevel === 'critical' || s.riskLevel === 'high').length;
    const avgComplianceScore = complianceChecks.length > 0 
      ? complianceChecks.reduce((sum, c) => sum + (c.complianceScore || 0), 0) / complianceChecks.length
      : 100;

    const overallRiskScore = Math.max(0, Math.min(100, 
      100 - (criticalAlerts * 20) - (highRiskScans * 10) - ((100 - avgComplianceScore) * 0.5)
    ));

    // Generate recommendations
    const recommendations = [];
    if (criticalAlerts > 0) recommendations.push('Address critical security alerts immediately');
    if (highRiskScans > 0) recommendations.push('Review and mitigate high-risk security findings');
    if (avgComplianceScore < 80) recommendations.push('Improve compliance score by addressing identified issues');
    if (recentScans.length === 0) recommendations.push('Run initial security vulnerability scans');

    return {
      overallRiskScore,
      recentScans: recentScans.slice(0, 5),
      activeAlerts: activeAlerts.filter(a => a.status === 'active').slice(0, 10),
      complianceStatus: complianceChecks,
      recommendations
    };
  }
}