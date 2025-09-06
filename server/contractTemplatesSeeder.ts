import { db } from "./db";
import { contractTemplates } from "../shared/schema";
import { eq } from "drizzle-orm";

// Comprehensive South African Professional Engagement Letter Templates
const SOUTH_AFRICAN_ENGAGEMENT_TEMPLATES = [
  {
    name: "Individual Income Tax Return (ITR12)",
    version: 1,
    servicePackage: "tax_compliance",
    bodyMd: `# ENGAGEMENT LETTER FOR INDIVIDUAL INCOME TAX RETURN SERVICES

**Client:** {{client_name}}  
**Tax Practitioner:** {{practitioner_name}}  
**Registration Number:** {{practitioner_number}}  
**Date:** {{engagement_date}}

## 1. ENGAGEMENT SCOPE

We are pleased to confirm our engagement to prepare your Individual Income Tax Return (ITR12) for the {{tax_year}} tax year ending {{year_end}}.

### Services Include:
- Preparation of Individual Income Tax Return (ITR12)
- Review of supporting documentation
- SARS eFiling submission
- Correspondence with SARS on your behalf
- Tax advice relating to the return

## 2. CLIENT RESPONSIBILITIES

You undertake to:
- Provide complete and accurate information
- Submit all required supporting documents by {{document_deadline}}
- Notify us of any changes to your tax affairs
- Pay professional fees as agreed

## 3. PROFESSIONAL FEES

Our professional fee for this engagement is {{fee_amount}} (inclusive of VAT).
Payment terms: {{payment_terms}}

## 4. LIMITATION OF LIABILITY

Our liability is limited to the amount of professional fees charged for this engagement.

## 5. CONFIDENTIALITY

All information will be treated as confidential in accordance with professional standards.

**Client Acceptance:**

Name: {{client_name}}  
Signature: ________________________  
Date: _______________

**Tax Practitioner:**

Name: {{practitioner_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "practitioner_name", "practitioner_number", "engagement_date", 
      "tax_year", "year_end", "document_deadline", "fee_amount", "payment_terms"
    ])
  },
  
  {
    name: "Company Income Tax Return (ITR14)",
    version: 1,
    servicePackage: "tax_compliance",
    bodyMd: `# ENGAGEMENT LETTER FOR COMPANY INCOME TAX RETURN SERVICES

**Client Company:** {{company_name}}  
**Registration Number:** {{company_reg_number}}  
**Tax Practitioner:** {{practitioner_name}}  
**Date:** {{engagement_date}}

## 1. ENGAGEMENT SCOPE

We confirm our engagement to prepare the Company Income Tax Return (ITR14) for {{company_name}} for the {{tax_year}} tax year ending {{year_end}}.

### Services Include:
- Preparation of Company Income Tax Return (ITR14)
- Review of Annual Financial Statements
- Tax computations and reconciliations
- SARS eFiling submission
- Provisional tax calculations where applicable
- Tax planning advice

## 2. MANAGEMENT RESPONSIBILITIES

Management is responsible for:
- Preparation of complete Annual Financial Statements
- Maintenance of proper accounting records
- Providing all supporting documentation
- Disclosure of all material transactions

## 3. PROFESSIONAL FEES

Base fee: {{base_fee}}
Complexity adjustment: {{complexity_fee}}
Total engagement fee: {{total_fee}} (excluding VAT)

## 4. DEADLINES

- AFS submission: {{afs_deadline}}
- ITR14 submission: {{itr14_deadline}}
- Payment due: {{payment_due}}

## 5. PROFESSIONAL STANDARDS

This engagement is conducted in accordance with:
- South African Institute of Tax Professionals (SAIT) Code of Conduct
- Tax Administration Act requirements
- Professional Body standards

**Authorized Representative:**

Company: {{company_name}}  
Name: {{signatory_name}}  
Position: {{signatory_position}}  
Signature: ________________________  
Date: _______________

**Tax Practitioner:**

Name: {{practitioner_name}}  
SAIT Registration: {{sait_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "company_reg_number", "practitioner_name", "engagement_date",
      "tax_year", "year_end", "base_fee", "complexity_fee", "total_fee",
      "afs_deadline", "itr14_deadline", "payment_due", "signatory_name", 
      "signatory_position", "sait_number"
    ])
  },

  {
    name: "VAT201 Compliance Services",
    version: 1,
    servicePackage: "vat_compliance",
    bodyMd: `# VAT COMPLIANCE SERVICES ENGAGEMENT LETTER

**Client:** {{client_name}}  
**VAT Number:** {{vat_number}}  
**Tax Practitioner:** {{practitioner_name}}  
**Date:** {{engagement_date}}

## 1. SERVICES PROVIDED

We will provide the following VAT compliance services:
- Monthly/Bi-monthly VAT201 return preparation
- VAT reconciliation and review
- Input VAT verification
- Output VAT calculations
- SARS eFiling submissions
- VAT advisory services

## 2. VAT PERIODS COVERED

This engagement covers VAT periods from {{start_period}} to {{end_period}}.
Returns will be submitted by the {{submission_deadline}} of each period.

## 3. CLIENT OBLIGATIONS

You agree to:
- Maintain proper VAT records
- Provide complete transaction records monthly
- Submit all source documents by {{monthly_deadline}}
- Implement recommended VAT procedures
- Pay VAT liabilities timeously

## 4. PROFESSIONAL FEES

Monthly service fee: {{monthly_fee}}
Annual engagement fee: {{annual_fee}}
Additional services charged at {{hourly_rate}} per hour.

## 5. VAT REGISTRATION COMPLIANCE

We confirm your VAT registration details:
- VAT Number: {{vat_number}}
- Registration Date: {{vat_reg_date}}
- Filing Frequency: {{filing_frequency}}

## 6. PENALTIES AND INTEREST

You remain responsible for:
- Late payment penalties
- Interest on overdue amounts
- Administrative penalties for non-compliance

**Client Agreement:**

{{client_name}}  
Signature: ________________________  
Date: _______________

**VAT Practitioner:**

{{practitioner_name}}  
VAT Practitioner Number: {{vat_practitioner_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "vat_number", "practitioner_name", "engagement_date",
      "start_period", "end_period", "submission_deadline", "monthly_deadline",
      "monthly_fee", "annual_fee", "hourly_rate", "vat_reg_date", 
      "filing_frequency", "vat_practitioner_number"
    ])
  },

  {
    name: "Audit Services Engagement Letter",
    version: 1,
    servicePackage: "audit_services",
    bodyMd: `# AUDIT ENGAGEMENT LETTER

**Client:** {{company_name}}  
**Audit Firm:** {{audit_firm_name}}  
**Financial Year End:** {{year_end}}  
**Date:** {{engagement_date}}

## 1. AUDIT OBJECTIVE AND SCOPE

We have been engaged to audit the Annual Financial Statements of {{company_name}} for the year ending {{year_end}}.

### Audit Scope:
- Statement of Financial Position
- Statement of Comprehensive Income
- Statement of Changes in Equity
- Statement of Cash Flows
- Notes to the Financial Statements

## 2. MANAGEMENT RESPONSIBILITIES

Management is responsible for:
- Preparation of Annual Financial Statements in accordance with {{accounting_framework}}
- Design and implementation of internal controls
- Prevention and detection of fraud and error
- Compliance with laws and regulations
- Providing auditors with access to all records

## 3. AUDITOR RESPONSIBILITIES

We will conduct our audit in accordance with:
- International Standards on Auditing (ISAs)
- IRBA Code of Professional Conduct
- Companies Act 71 of 2008 requirements

## 4. AUDIT MATERIALITY

Materiality for the audit will be determined based on {{materiality_basis}} and communicated during the audit.

## 5. PROFESSIONAL FEES

Audit fee: {{audit_fee}} (excluding VAT)
Additional services: {{additional_services_fee}}
Total engagement fee: {{total_fee}}

Payment terms: {{payment_terms}}

## 6. REPORTING

We will issue:
- Independent Auditor's Report
- Management Letter (if applicable)
- Report on Internal Controls (if required)

## 7. DEADLINES

- Draft AFS due: {{draft_afs_deadline}}
- Final AFS and audit completion: {{final_deadline}}
- Filing with CIPC: {{cipc_deadline}}

**Management Acceptance:**

Company: {{company_name}}  
Director: {{director_name}}  
Signature: ________________________  
Date: _______________

**Audit Partner:**

Firm: {{audit_firm_name}}  
Partner: {{partner_name}}  
IRBA Number: {{irba_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "audit_firm_name", "year_end", "engagement_date",
      "accounting_framework", "materiality_basis", "audit_fee", 
      "additional_services_fee", "total_fee", "payment_terms",
      "draft_afs_deadline", "final_deadline", "cipc_deadline",
      "director_name", "partner_name", "irba_number"
    ])
  },

  {
    name: "Independent Review Engagement",
    version: 1,
    servicePackage: "review_services",
    bodyMd: `# INDEPENDENT REVIEW ENGAGEMENT LETTER

**Client:** {{company_name}}  
**Accounting Firm:** {{firm_name}}  
**Review Period:** Year ending {{year_end}}  
**Date:** {{engagement_date}}

## 1. NATURE OF REVIEW ENGAGEMENT

We will perform an independent review of the Annual Financial Statements of {{company_name}} for the year ending {{year_end}}.

A review is substantially less in scope than an audit and provides limited assurance.

## 2. REVIEW PROCEDURES

Our review will consist primarily of:
- Inquiry of company personnel
- Analytical procedures applied to financial data
- Obtaining an understanding of the accounting and financial reporting practices

## 3. MANAGEMENT REPRESENTATIONS

We will obtain written representations from management regarding:
- Responsibilities for the financial statements
- All material information has been provided
- Subsequent events have been disclosed

## 4. REPORTING

We will issue an Independent Review Report expressing limited assurance that nothing has come to our attention indicating the financial statements are materially misstated.

## 5. PROFESSIONAL STANDARDS

This review engagement is conducted in accordance with:
- International Standard on Review Engagements (ISRE) 2400
- SAICA Professional Standards
- Companies Act requirements (where applicable)

## 6. PROFESSIONAL FEES

Review engagement fee: {{review_fee}} (excluding VAT)
Additional services: {{additional_fee}}
Total: {{total_engagement_fee}}

## 7. LIMITATIONS

A review does not:
- Provide assurance on fraud detection
- Replace management's responsibility for internal controls
- Guarantee detection of all material misstatements

**Client Acknowledgment:**

Company: {{company_name}}  
Representative: {{client_representative}}  
Position: {{representative_position}}  
Signature: ________________________  
Date: _______________

**Review Partner:**

Firm: {{firm_name}}  
Partner: {{review_partner}}  
CA(SA) Registration: {{ca_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "firm_name", "year_end", "engagement_date",
      "review_fee", "additional_fee", "total_engagement_fee",
      "client_representative", "representative_position", 
      "review_partner", "ca_number"
    ])
  },

  {
    name: "Bookkeeping Services Agreement",
    version: 1,
    servicePackage: "bookkeeping",
    bodyMd: `# BOOKKEEPING SERVICES ENGAGEMENT LETTER

**Client:** {{client_name}}  
**Bookkeeping Firm:** {{firm_name}}  
**Service Period:** {{service_start}} to {{service_end}}  
**Date:** {{engagement_date}}

## 1. SERVICES PROVIDED

We will provide the following bookkeeping services:
- Transaction recording and classification
- Bank reconciliations
- Accounts payable and receivable management
- Monthly management reports
- VAT reconciliation (if registered)
- Payroll processing (if applicable)

## 2. SERVICE FREQUENCY

- Transaction processing: {{processing_frequency}}
- Bank reconciliations: {{recon_frequency}}
- Management reports: {{reporting_frequency}}
- Client meetings: {{meeting_frequency}}

## 3. CLIENT RESPONSIBILITIES

You undertake to:
- Provide all source documents timeously
- Maintain proper filing systems
- Bank all receipts and make payments through business accounts
- Provide monthly bank statements by {{statement_deadline}}
- Review and approve monthly reports

## 4. DELIVERABLES

Monthly deliverables include:
- Trial Balance
- Profit & Loss Statement
- Balance Sheet
- Aged Debtors and Creditors reports
- Bank reconciliation statements
- Management commentary

## 5. PROFESSIONAL FEES

Monthly service fee: {{monthly_fee}}
Additional services: {{hourly_rate}} per hour
Annual service agreement: {{annual_fee}} (if applicable)

Payment terms: {{payment_terms}}

## 6. SOFTWARE AND SYSTEMS

Accounting software: {{accounting_software}}
Cloud access provided: {{cloud_access}}
Training included: {{training_hours}} hours

## 7. CONFIDENTIALITY AND DATA PROTECTION

All client information will be:
- Kept strictly confidential
- Protected according to POPIA requirements
- Backed up securely
- Accessible only to authorized personnel

**Service Agreement:**

Client: {{client_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Bookkeeping Firm:**

Firm: {{firm_name}}  
Principal: {{principal_name}}  
Professional Designation: {{professional_designation}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "firm_name", "service_start", "service_end", "engagement_date",
      "processing_frequency", "recon_frequency", "reporting_frequency", 
      "meeting_frequency", "statement_deadline", "monthly_fee", "hourly_rate",
      "annual_fee", "payment_terms", "accounting_software", "cloud_access",
      "training_hours", "authorized_person", "principal_name", "professional_designation"
    ])
  },

  {
    name: "Payroll Services Engagement",
    version: 1,
    servicePackage: "payroll",
    bodyMd: `# PAYROLL SERVICES ENGAGEMENT LETTER

**Client Company:** {{company_name}}  
**Payroll Service Provider:** {{provider_name}}  
**Service Commencement:** {{start_date}}  
**Date:** {{engagement_date}}

## 1. PAYROLL SERVICES

We will provide comprehensive payroll services including:
- Monthly salary calculations
- PAYE and UIF deductions
- SDL and Skills Development Levy calculations
- IRP5 and IRP6 preparation
- EMP201 monthly submissions
- EMP501 reconciliation
- Annual employee certificates

## 2. EMPLOYEE DATA MANAGEMENT

Services include:
- Employee master data maintenance
- New starter setups
- Leaver processing and final pay calculations
- Leave management integration
- Benefit administration
- Loan and garnishee deductions

## 3. COMPLIANCE OBLIGATIONS

We will ensure compliance with:
- Basic Conditions of Employment Act
- Labour Relations Act
- Employment Equity Act
- Skills Development Act
- Income Tax Act (4th Schedule)
- Unemployment Insurance Act

## 4. SARS OBLIGATIONS

Monthly SARS submissions:
- EMP201 submission by {{emp201_deadline}}
- Payment of PAYE, UIF, and SDL
- Annual EMP501 reconciliation
- IRP5 certificates by {{irp5_deadline}}

## 5. CLIENT RESPONSIBILITIES

You are responsible for:
- Providing accurate employee information
- Timekeeping and attendance records
- Leave applications and approvals
- Salary change authorizations
- Banking details updates
- Statutory compliance for labour law

## 6. PROFESSIONAL FEES

Setup fee: {{setup_fee}}
Monthly fee per employee: {{per_employee_fee}}
Minimum monthly charge: {{minimum_fee}}
Annual reconciliation: {{annual_recon_fee}}

## 7. REPORTING

Monthly deliverables:
- Payroll registers
- Bank payment files
- SARS liability reports
- Management payroll summaries
- Exception reports

**Client Agreement:**

Company: {{company_name}}  
HR/Finance Manager: {{manager_name}}  
Signature: ________________________  
Date: _______________

**Payroll Service Provider:**

Provider: {{provider_name}}  
Principal: {{principal_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "provider_name", "start_date", "engagement_date",
      "emp201_deadline", "irp5_deadline", "setup_fee", "per_employee_fee",
      "minimum_fee", "annual_recon_fee", "manager_name", "principal_name"
    ])
  },

  {
    name: "CIPC Annual Return Services",
    version: 1,
    servicePackage: "compliance",
    bodyMd: `# CIPC ANNUAL RETURN SERVICES ENGAGEMENT

**Client Company:** {{company_name}}  
**Registration Number:** {{company_reg_number}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. CIPC COMPLIANCE SERVICES

We will provide the following CIPC annual return services:
- Annual Return (AR) preparation and submission
- Director and shareholding updates
- Registered office address confirmations
- Share capital verifications
- Beneficial ownership disclosures (if applicable)

## 2. COMPANY INFORMATION REVIEW

We will verify and update:
- Director appointments and resignations
- Secretary appointments
- Share register accuracy
- Memorandum of Incorporation amendments
- Registration address changes

## 3. ANNUAL RETURN DEADLINE

Company Annual Return due date: {{ar_due_date}}
Our internal deadline: {{internal_deadline}}
Buffer period: {{buffer_days}} days before CIPC deadline

## 4. REQUIRED DOCUMENTATION

Please provide:
- Current share register
- Director resolution for annual return
- Updated director details and addresses
- Any MOI amendments during the year
- Audit/AFS information (if applicable)

## 5. ADDITIONAL COMPLIANCE SERVICES

Available additional services:
- CIPC name reservations
- MOI amendments
- Director appointment/resignation filings
- Address change notifications
- Company restoration services

## 6. PROFESSIONAL FEES

Annual Return service: {{ar_fee}}
Additional filings: {{additional_filing_fee}} each
Urgent submissions (less than 7 days): {{urgent_fee}} surcharge
Payment terms: {{payment_terms}}

## 7. PENALTIES AND LATE FEES

CIPC penalties for late filing:
- 1-30 days late: R100
- 31-365 days late: R500  
- Over 365 days: Company may be deregistered

Client remains liable for all CIPC penalties and costs.

**Company Authorization:**

Company: {{company_name}}  
Director/Secretary: {{authorized_person}}  
Position: {{person_position}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

Provider: {{provider_name}}  
Principal: {{principal_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "company_reg_number", "provider_name", "engagement_date",
      "ar_due_date", "internal_deadline", "buffer_days", "ar_fee",
      "additional_filing_fee", "urgent_fee", "payment_terms",
      "authorized_person", "person_position", "principal_name"
    ])
  },

  {
    name: "Business Advisory Services",
    version: 1,
    servicePackage: "advisory",
    bodyMd: `# BUSINESS ADVISORY SERVICES ENGAGEMENT

**Client:** {{client_name}}  
**Advisory Firm:** {{firm_name}}  
**Engagement Period:** {{engagement_period}}  
**Date:** {{engagement_date}}

## 1. ADVISORY SERVICES SCOPE

We will provide strategic business advisory services including:
- Financial planning and analysis
- Business performance review
- Strategic planning facilitation
- Management reporting system design
- Cash flow management advice
- Growth strategy development

## 2. KEY FOCUS AREAS

This engagement will focus on:
- {{focus_area_1}}
- {{focus_area_2}}
- {{focus_area_3}}
- {{focus_area_4}}

## 3. DELIVERABLES

Expected deliverables include:
- Monthly management pack template
- Financial dashboard development
- Business plan review and update
- Key Performance Indicator (KPI) framework
- Cash flow forecasting model
- Strategic recommendations report

## 4. ENGAGEMENT METHODOLOGY

Our approach includes:
- Initial business diagnostic
- Stakeholder interviews
- Financial analysis and benchmarking
- Industry best practice research
- Solution design and implementation
- Progress monitoring and review

## 5. CLIENT COMMITMENT

Successful completion requires:
- Management time commitment: {{management_hours}} hours per month
- Access to all relevant business information
- Implementation of agreed recommendations
- Regular progress review meetings
- Open communication throughout the engagement

## 6. PROFESSIONAL FEES

Total engagement fee: {{total_fee}}
Payment schedule: {{payment_schedule}}
Additional work: {{hourly_rate}} per hour
Out-of-pocket expenses: {{expense_handling}}

## 7. SUCCESS MEASURES

Success will be measured by:
- Improved financial reporting accuracy
- Enhanced management decision-making
- Increased operational efficiency
- Better cash flow management
- Achievement of business objectives

**Client Commitment:**

Client: {{client_name}}  
Business Owner/CEO: {{client_ceo}}  
Signature: ________________________  
Date: _______________

**Advisory Firm:**

Firm: {{firm_name}}  
Senior Advisor: {{senior_advisor}}  
Qualifications: {{advisor_qualifications}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "firm_name", "engagement_period", "engagement_date",
      "focus_area_1", "focus_area_2", "focus_area_3", "focus_area_4",
      "management_hours", "total_fee", "payment_schedule", "hourly_rate",
      "expense_handling", "client_ceo", "senior_advisor", "advisor_qualifications"
    ])
  }
];

export async function seedContractTemplates(companyId: number, userId: number) {
  console.log("🔄 Ensuring South African professional engagement letter templates are available...");
  
  try {
    // Get existing templates for this company
    const existingTemplates = await db.select()
      .from(contractTemplates)
      .where(eq(contractTemplates.companyId, companyId));
    
    // Create a set of existing template names for quick lookup
    const existingTemplateNames = new Set(existingTemplates.map(t => t.name));
    
    // Track what templates need to be added
    const templatesToAdd = SOUTH_AFRICAN_ENGAGEMENT_TEMPLATES.filter(
      template => !existingTemplateNames.has(template.name)
    );
    
    if (templatesToAdd.length === 0) {
      console.log(`✓ All SA professional templates already exist for company ${companyId}`);
      return;
    }

    // Insert missing templates
    for (const template of templatesToAdd) {
      await db.insert(contractTemplates).values({
        companyId,
        name: template.name,
        version: template.version,
        bodyMd: template.bodyMd,
        fields: template.fields,
        servicePackage: template.servicePackage,
        createdBy: userId
      });
    }

    console.log(`✓ Successfully added ${templatesToAdd.length} missing SA professional templates`);
    console.log("📋 Templates added:");
    templatesToAdd.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.servicePackage})`);
    });

  } catch (error) {
    console.error("❌ Error ensuring contract templates:", error);
    throw error;
  }
}