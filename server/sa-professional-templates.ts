// Comprehensive South African Professional Engagement Letter Templates
// Compliant with SA laws and professional standards

export const SOUTH_AFRICAN_PROFESSIONAL_TEMPLATES = [
  // ==========================================
  // TAX COMPLIANCE SERVICES (15 templates)
  // ==========================================
  
  {
    name: "Individual Income Tax Return (ITR12) - Standard",
    servicePackage: "tax_compliance",
    bodyMd: `# ENGAGEMENT LETTER FOR INDIVIDUAL INCOME TAX RETURN SERVICES

**Client:** {{client_name}}  
**ID Number:** {{id_number}}  
**Tax Reference Number:** {{tax_number}}  
**Tax Practitioner:** {{practitioner_name}}  
**SAIT Registration:** {{sait_number}}  
**Date:** {{engagement_date}}

## 1. ENGAGEMENT SCOPE

We are pleased to confirm our engagement to prepare and submit your Individual Income Tax Return (ITR12) for the {{tax_year}} tax year ending {{year_end}} in accordance with the Income Tax Act 58 of 1962.

### Services Include:
- Comprehensive review of all income sources
- Preparation of Individual Income Tax Return (ITR12)
- Verification of supporting documentation
- Tax deduction optimization and allowable expense claims
- SARS eFiling submission
- Correspondence with SARS on your behalf
- Tax assessment review and objection if necessary

## 2. CLIENT RESPONSIBILITIES

In terms of the Tax Administration Act 28 of 2011, you undertake to:
- Provide complete, accurate and truthful information
- Submit all required supporting documents by {{document_deadline}}
- Notify us of any changes to your tax affairs within 21 days
- Maintain proper records for 5 years
- Pay professional fees as agreed

## 3. PROFESSIONAL FEES

Our professional fee structure:
- Base fee: {{base_fee}} (excl. VAT)
- Complex returns (multiple income sources): {{complex_fee}} 
- Objections and appeals: {{objection_fee}} per hour
- Payment terms: {{payment_terms}}

## 4. LIMITATION OF LIABILITY

Our liability is limited to 3 times the professional fees charged for this engagement, subject to professional indemnity insurance.

## 5. CONFIDENTIALITY

All information will be treated as confidential in accordance with:
- SAIT Code of Professional Conduct
- Protection of Personal Information Act (POPIA)

**Client Acceptance:**

Name: {{client_name}}  
ID Number: {{id_number}}  
Signature: ________________________  
Date: _______________

**Tax Practitioner:**

Name: {{practitioner_name}}  
SAIT Registration: {{sait_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "id_number", "tax_number", "practitioner_name", "sait_number",
      "engagement_date", "tax_year", "year_end", "document_deadline", "base_fee",
      "complex_fee", "objection_fee", "payment_terms"
    ])
  },

  {
    name: "Company Income Tax Return (ITR14) - Comprehensive",
    servicePackage: "tax_compliance",
    bodyMd: `# ENGAGEMENT LETTER FOR COMPANY INCOME TAX RETURN SERVICES

**Client Company:** {{company_name}}  
**Registration Number:** {{company_reg_number}}  
**Tax Reference Number:** {{tax_reference}}  
**Tax Practitioner:** {{practitioner_name}}  
**Date:** {{engagement_date}}

## 1. ENGAGEMENT SCOPE

We confirm our engagement to prepare the Company Income Tax Return (ITR14) and supporting schedules for {{company_name}} for the {{tax_year}} tax year ending {{year_end}} in compliance with the Income Tax Act 58 of 1962 and Companies Act 71 of 2008.

### Services Include:
- Preparation of ITR14 and all supporting schedules
- Review of Annual Financial Statements
- Tax computations and reconciliations
- Deferred tax calculations
- Capital allowances and wear-and-tear computations
- Transfer pricing documentation review
- SARS eFiling submission
- Provisional tax calculations and advice

## 2. MANAGEMENT RESPONSIBILITIES

As per Section 29 of the Tax Administration Act, management is responsible for:
- Preparation of complete Annual Financial Statements
- Maintenance of proper accounting records
- Providing all supporting documentation
- Disclosure of all material transactions
- Compliance with tax laws and regulations

## 3. PROFESSIONAL FEES

Fee structure:
- Base fee (up to R10m turnover): {{base_fee}}
- Medium companies (R10m-R50m): {{medium_fee}}
- Large companies (>R50m): {{large_fee}}
- Transfer pricing documentation: {{tp_fee}}
- Total engagement fee: {{total_fee}} (excluding VAT)

## 4. KEY DEADLINES

- AFS submission: {{afs_deadline}}
- ITR14 submission: {{itr14_deadline}}
- First provisional payment: {{prov1_date}}
- Second provisional payment: {{prov2_date}}
- Third provisional (if applicable): {{prov3_date}}

## 5. PROFESSIONAL STANDARDS

This engagement is conducted in accordance with:
- South African Institute of Tax Professionals (SAIT) standards
- Tax Administration Act 28 of 2011
- Companies Act 71 of 2008 requirements
- International Tax Standards

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
      "company_name", "company_reg_number", "tax_reference", "practitioner_name",
      "engagement_date", "tax_year", "year_end", "base_fee", "medium_fee",
      "large_fee", "tp_fee", "total_fee", "afs_deadline", "itr14_deadline",
      "prov1_date", "prov2_date", "prov3_date", "signatory_name",
      "signatory_position", "sait_number"
    ])
  },

  {
    name: "VAT201 Monthly Compliance Services",
    servicePackage: "vat_compliance",
    bodyMd: `# VAT COMPLIANCE SERVICES ENGAGEMENT LETTER

**Client:** {{client_name}}  
**VAT Number:** {{vat_number}}  
**Tax Practitioner:** {{practitioner_name}}  
**Date:** {{engagement_date}}

## 1. SERVICES PROVIDED

In accordance with the Value-Added Tax Act 89 of 1991, we will provide:
- Monthly VAT201 return preparation and submission
- VAT reconciliation and review
- Input VAT verification and apportionment
- Output VAT calculations
- Zero-rating documentation review
- Import VAT verifications
- SARS eFiling submissions
- VAT audit support

## 2. VAT PERIODS COVERED

This engagement covers VAT periods from {{start_period}} to {{end_period}}.
Filing frequency: {{filing_frequency}}
Returns submitted by: {{submission_deadline}} of each period

## 3. CLIENT OBLIGATIONS

Per VAT Act requirements, you agree to:
- Maintain proper VAT records for 5 years
- Provide complete transaction records by {{monthly_deadline}}
- Issue valid tax invoices
- Implement recommended VAT procedures
- Pay VAT liabilities by due date

## 4. PROFESSIONAL FEES

Fee structure:
- Monthly service fee: {{monthly_fee}}
- Annual engagement fee: {{annual_fee}}
- VAT audit support: {{audit_rate}} per hour
- Diesel refund claims: {{diesel_fee}} per claim

## 5. VAT REGISTRATION DETAILS

- VAT Number: {{vat_number}}
- Registration Date: {{vat_reg_date}}
- Category: {{vat_category}}
- Filing Frequency: {{filing_frequency}}
- Payment Method: {{payment_method}}

## 6. PENALTIES AND INTEREST

Per Chapter 15 of the Tax Administration Act:
- Late payment penalty: 10% of amount due
- Interest: SARS prescribed rate
- Administrative penalties: Up to R16,000 per return

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
      "start_period", "end_period", "filing_frequency", "submission_deadline",
      "monthly_deadline", "monthly_fee", "annual_fee", "audit_rate",
      "diesel_fee", "vat_reg_date", "vat_category", "payment_method",
      "vat_practitioner_number"
    ])
  },

  {
    name: "PAYE Monthly Submission Services (EMP201)",
    servicePackage: "tax_compliance",
    bodyMd: `# PAYE COMPLIANCE SERVICES ENGAGEMENT

**Employer:** {{employer_name}}  
**PAYE Reference:** {{paye_reference}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. PAYE COMPLIANCE SERVICES

We will provide comprehensive PAYE services per the Fourth Schedule of the Income Tax Act:
- Monthly EMP201 preparation and submission
- PAYE, UIF, and SDL calculations verification
- EMP501 bi-annual reconciliation
- IRP5/IT3(a) certificate preparation
- ETI (Employment Tax Incentive) claims
- SARS correspondence and queries

## 2. EMPLOYER OBLIGATIONS

As per the Tax Administration Act, you must:
- Register all employees for tax
- Deduct correct PAYE monthly
- Submit EMP201 by the 7th of each month
- Pay over deductions to SARS
- Issue IRP5 certificates by 31 May

## 3. SERVICE DELIVERABLES

Monthly deliverables:
- EMP201 return preparation
- PAYE liability schedule
- ETI claim documentation
- Exception reports
- Compliance certificates

## 4. PROFESSIONAL FEES

- Monthly EMP201 service: {{monthly_emp_fee}}
- Bi-annual reconciliation: {{recon_fee}}
- IRP5 certificates: {{irp5_fee}} per employee
- SARS dispute resolution: {{dispute_rate}} per hour

## 5. PENALTIES (Per Tax Administration Act)

- Late submission: 10% penalty
- Late payment: 10% penalty plus interest
- Non-submission: Up to R16,000
- Incorrect information: Personal liability for directors

**Employer Agreement:**

Company: {{employer_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Tax Practitioner: {{practitioner_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "employer_name", "paye_reference", "provider_name", "engagement_date",
      "monthly_emp_fee", "recon_fee", "irp5_fee", "dispute_rate",
      "authorized_person", "practitioner_name"
    ])
  },

  {
    name: "Provisional Tax Services (IRP6)",
    servicePackage: "tax_compliance",
    bodyMd: `# PROVISIONAL TAX SERVICES ENGAGEMENT

**Taxpayer:** {{taxpayer_name}}  
**Tax Number:** {{tax_number}}  
**Tax Practitioner:** {{practitioner_name}}  
**Date:** {{engagement_date}}

## 1. PROVISIONAL TAX SERVICES

We will provide provisional tax services per paragraph 17-29 of the Fourth Schedule:
- First provisional tax calculation and IRP6 submission
- Second provisional tax calculation and submission
- Third provisional (top-up) payment advice
- Cash flow planning for tax payments
- Penalty minimization strategies

## 2. KEY DATES AND DEADLINES

Tax year ending: {{year_end}}
- First period ends: {{first_period_end}}
- First payment due: {{first_payment_date}}
- Second period ends: {{second_period_end}}
- Second payment due: {{second_payment_date}}
- Third payment (if applicable): {{third_payment_date}}

## 3. ESTIMATION BASIS

Provisional tax estimates based on:
- Basic amount (prior year taxable income)
- Current year projections
- Seasonal variations
- Once-off transactions

## 4. PENALTIES AND INTEREST

Per Fourth Schedule penalties:
- Underestimation penalty: 20% of underpayment
- Late payment interest: SARS prescribed rate
- Third payment: Interest from effective date

## 5. PROFESSIONAL FEES

- First provisional: {{first_prov_fee}}
- Second provisional: {{second_prov_fee}}
- Third provisional advice: {{third_prov_fee}}
- Total engagement: {{total_prov_fee}}

**Client Acknowledgment:**

Name: {{taxpayer_name}}  
Signature: ________________________  
Date: _______________

**Tax Practitioner:**

Name: {{practitioner_name}}  
Registration: {{registration_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "taxpayer_name", "tax_number", "practitioner_name", "engagement_date",
      "year_end", "first_period_end", "first_payment_date", "second_period_end",
      "second_payment_date", "third_payment_date", "first_prov_fee",
      "second_prov_fee", "third_prov_fee", "total_prov_fee", "registration_number"
    ])
  },

  {
    name: "Trust Income Tax Return (ITR12T)",
    servicePackage: "tax_compliance",
    bodyMd: `# TRUST TAX RETURN SERVICES ENGAGEMENT

**Trust Name:** {{trust_name}}  
**Trust Number:** {{trust_number}}  
**Tax Reference:** {{tax_reference}}  
**Tax Practitioner:** {{practitioner_name}}  
**Date:** {{engagement_date}}

## 1. TRUST TAX SERVICES

We will prepare the Trust Income Tax Return (ITR12T) in accordance with:
- Income Tax Act sections relating to trusts
- Trust Property Control Act 57 of 1988
- Estate Duty Act considerations

### Services Include:
- ITR12T preparation and submission
- Beneficiary distribution calculations
- Vesting and discretionary income allocation
- Capital gains tax computations
- Estate planning advice

## 2. TRUSTEE RESPONSIBILITIES

Trustees must provide:
- Complete trust financial records
- Beneficiary information and distributions
- Trust deed and amendments
- Asset and liability schedules
- Investment income details

## 3. TAX IMPLICATIONS

Current trust tax rate: 45%
Interest exemption: {{interest_exemption}}
Capital gains inclusion rate: 80%
Attribution rules application

## 4. PROFESSIONAL FEES

- Trust return preparation: {{trust_return_fee}}
- Beneficiary certificates: {{beneficiary_cert_fee}}
- Estate planning consultation: {{consultation_fee}}

**Trustee Authorization:**

Trust: {{trust_name}}  
Trustee Name: {{trustee_name}}  
Signature: ________________________  
Date: _______________

**Tax Practitioner:**

Name: {{practitioner_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "trust_name", "trust_number", "tax_reference", "practitioner_name",
      "engagement_date", "interest_exemption", "trust_return_fee",
      "beneficiary_cert_fee", "consultation_fee", "trustee_name"
    ])
  },

  {
    name: "Estate Tax Return Services",
    servicePackage: "tax_compliance",
    bodyMd: `# ESTATE TAX RETURN ENGAGEMENT

**Estate Late:** {{deceased_name}}  
**Estate Number:** {{estate_number}}  
**Executor:** {{executor_name}}  
**Tax Practitioner:** {{practitioner_name}}  
**Date:** {{engagement_date}}

## 1. ESTATE TAX SERVICES

Services per the Estate Duty Act 45 of 1955 and Income Tax Act:
- Estate duty return preparation
- Income tax returns for deceased and estate
- Capital gains tax calculations
- Liquidation and distribution account review
- SARS correspondence

## 2. REQUIRED DOCUMENTATION

- Death certificate
- Last will and testament
- Asset valuations at date of death
- Liability schedules
- Income to date of death
- Beneficiary details

## 3. ESTATE DUTY CALCULATION

- Gross estate value
- Allowable deductions (Section 4)
- Section 4A abatement: R3.5 million
- Estate duty rate: 20% (25% above R30m)

## 4. DEADLINES

- Estate duty return: Within 12 months
- Income tax returns: Standard deadlines
- CGT payment: Within 7 months

## 5. PROFESSIONAL FEES

- Estate duty return: {{estate_duty_fee}}
- Income tax returns: {{income_tax_fee}}
- Advisory services: {{advisory_rate}} per hour

**Executor Agreement:**

Estate: {{deceased_name}}  
Executor: {{executor_name}}  
Signature: ________________________  
Date: _______________

**Tax Practitioner:**

Name: {{practitioner_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "deceased_name", "estate_number", "executor_name", "practitioner_name",
      "engagement_date", "estate_duty_fee", "income_tax_fee", "advisory_rate"
    ])
  },

  {
    name: "Dividends Tax Compliance Services",
    servicePackage: "tax_compliance",
    bodyMd: `# DIVIDENDS TAX COMPLIANCE ENGAGEMENT

**Company:** {{company_name}}  
**Registration:** {{company_registration}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. DIVIDENDS TAX SERVICES

Services per Part VIII of Chapter II of the Income Tax Act:
- Dividends tax calculations (20% rate)
- DTR1 return preparation
- Exemption certificate management
- Beneficial owner declarations
- Foreign shareholder reduced rates
- SARS compliance

## 2. COMPLIANCE REQUIREMENTS

- Withhold 20% dividends tax
- Submit DTR1 monthly returns
- Maintain exemption declarations
- Apply treaty reduced rates
- Issue dividend statements

## 3. KEY RESPONSIBILITIES

Company must:
- Declare dividends properly
- Verify shareholder exemptions
- Withhold correct tax
- Submit returns by month-end
- Maintain proper records

## 4. PROFESSIONAL FEES

- Monthly DTR1 submission: {{monthly_dtr_fee}}
- Annual compliance review: {{annual_review_fee}}
- Treaty relief applications: {{treaty_fee}}

**Company Authorization:**

Company: {{company_name}}  
Director: {{director_name}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Representative: {{representative_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "company_registration", "provider_name", "engagement_date",
      "monthly_dtr_fee", "annual_review_fee", "treaty_fee", "director_name",
      "representative_name"
    ])
  },

  {
    name: "Capital Gains Tax Advisory Services",
    servicePackage: "tax_compliance",
    bodyMd: `# CAPITAL GAINS TAX ADVISORY ENGAGEMENT

**Client:** {{client_name}}  
**Tax Advisor:** {{advisor_name}}  
**Date:** {{engagement_date}}

## 1. CGT ADVISORY SERVICES

Services per the Eighth Schedule of the Income Tax Act:
- CGT calculations on asset disposals
- Base cost determinations
- Valuation date value calculations
- Primary residence exclusions
- Small business CGT concessions
- Annual exclusion optimization

## 2. CGT RATES AND EXCLUSIONS

Individuals:
- Inclusion rate: 40%
- Annual exclusion: R40,000
- Primary residence: R2 million gain exclusion

Companies:
- Inclusion rate: 80%
- No annual exclusion

Trusts:
- Inclusion rate: 80%
- Annual exclusion: R40,000 (certain trusts)

## 3. VALUATION REQUIREMENTS

Pre-1 October 2001 assets:
- Market value valuation
- Time-apportionment base cost
- 20% of proceeds method

## 4. PROFESSIONAL FEES

- CGT calculation: {{cgt_calc_fee}}
- Valuation coordination: {{valuation_fee}}
- Tax planning advice: {{planning_fee}}

**Client Agreement:**

Name: {{client_name}}  
Signature: ________________________  
Date: _______________

**Tax Advisor:**

Name: {{advisor_name}}  
Registration: {{advisor_registration}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "advisor_name", "engagement_date", "cgt_calc_fee",
      "valuation_fee", "planning_fee", "advisor_registration"
    ])
  },

  {
    name: "Transfer Duty Services",
    servicePackage: "tax_compliance",
    bodyMd: `# TRANSFER DUTY SERVICES ENGAGEMENT

**Purchaser:** {{purchaser_name}}  
**Property:** {{property_description}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. TRANSFER DUTY SERVICES

Services per the Transfer Duty Act 40 of 1949:
- Transfer duty calculations
- Exemption determinations
- SARS submission and payment
- Receipt procurement
- Conveyancing support

## 2. TRANSFER DUTY RATES

Natural persons:
- R0 - R1,100,000: 0%
- R1,100,001 - R1,512,500: 3%
- R1,512,501 - R2,117,500: 6%
- R2,117,501 - R2,722,500: 8%
- R2,722,501 - R3,600,000: 11%
- Above R3,600,000: 13%

Companies and trusts: Flat 13%

## 3. PAYMENT TIMELINE

Transfer duty payment required:
- Within 6 months from date of acquisition

## 4. PROFESSIONAL FEES

- Transfer duty calculation: {{calc_fee}}
- SARS submission: {{submission_fee}}
- Total service fee: {{total_service_fee}}

**Purchaser Agreement:**

Name: {{purchaser_name}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Representative: {{representative}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "purchaser_name", "property_description", "provider_name", "engagement_date",
      "calc_fee", "submission_fee", "total_service_fee", "representative"
    ])
  },

  {
    name: "Customs and Excise Compliance",
    servicePackage: "tax_compliance",
    bodyMd: `# CUSTOMS AND EXCISE COMPLIANCE ENGAGEMENT

**Importer/Exporter:** {{company_name}}  
**Customs Code:** {{customs_code}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. CUSTOMS SERVICES

Services per the Customs and Excise Act 91 of 1964:
- Import/export documentation
- Customs clearance assistance
- Duty and VAT calculations
- Tariff classification advice
- Customs audits support
- Refund and rebate claims

## 2. COMPLIANCE REQUIREMENTS

- Accurate declarations
- Proper valuation methods
- Correct tariff classifications
- Origin verification
- Record keeping (5 years)

## 3. DUTIES AND TAXES

- Customs duty per tariff schedule
- Import VAT at 15%
- Excise duties where applicable
- Anti-dumping duties
- Safeguard duties

## 4. PROFESSIONAL FEES

- Monthly retainer: {{monthly_retainer}}
- Per declaration: {{per_declaration_fee}}
- Audit support: {{audit_support_rate}} per hour

**Client Authorization:**

Company: {{company_name}}  
Authorized Officer: {{authorized_officer}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Customs Specialist: {{specialist_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "customs_code", "provider_name", "engagement_date",
      "monthly_retainer", "per_declaration_fee", "audit_support_rate",
      "authorized_officer", "specialist_name"
    ])
  },

  {
    name: "Tax Clearance Certificate Application",
    servicePackage: "tax_compliance",
    bodyMd: `# TAX CLEARANCE CERTIFICATE SERVICE

**Applicant:** {{applicant_name}}  
**Tax Number:** {{tax_number}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. TAX CLEARANCE SERVICES

We will assist with Tax Clearance Certificate applications per Tax Administration Act:
- Tax compliance status verification
- Outstanding return submissions
- Tax debt clearance
- Good standing applications
- Foreign investment allowance clearance

## 2. REQUIREMENTS FOR CLEARANCE

All tax types must be compliant:
- Income Tax (ITR12/ITR14)
- VAT (if registered)
- PAYE (if applicable)
- UIF contributions
- Skills Development Levy

## 3. VALIDITY PERIOD

- Tax Clearance: 12 months
- Good Standing: Continuous if compliant
- Tender Tax Clearance: As per tender requirements

## 4. PROFESSIONAL FEES

- Standard application: {{standard_fee}}
- Urgent processing: {{urgent_fee}}
- Compliance remediation: {{remediation_rate}} per hour

**Applicant Authorization:**

Name: {{applicant_name}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Tax Practitioner: {{practitioner_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "applicant_name", "tax_number", "provider_name", "engagement_date",
      "standard_fee", "urgent_fee", "remediation_rate", "practitioner_name"
    ])
  },

  {
    name: "Section 18A Tax Certificate Services",
    servicePackage: "tax_compliance",
    bodyMd: `# SECTION 18A TAX CERTIFICATE SERVICES

**Organization:** {{organization_name}}  
**PBO Number:** {{pbo_number}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. SECTION 18A SERVICES

Services for Public Benefit Organizations per Section 18A of Income Tax Act:
- Donation receipt preparation
- Section 18A certificate issuance
- Donor record maintenance
- SARS audit file preparation
- Compliance monitoring

## 2. PBO COMPLIANCE

Requirements for Section 18A status:
- Valid PBO registration
- Approved PBO activities
- Proper donation records
- Annual ITR12EI submission
- Audit trail maintenance

## 3. CERTIFICATE REQUIREMENTS

Each certificate must contain:
- PBO name and number
- Donor details
- Donation date and amount
- Nature of donation
- Certificate number

## 4. PROFESSIONAL FEES

- Certificate system setup: {{setup_fee}}
- Monthly certificate management: {{monthly_management}}
- Annual compliance review: {{annual_review}}

**Organization Agreement:**

PBO: {{organization_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Consultant: {{consultant_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "organization_name", "pbo_number", "provider_name", "engagement_date",
      "setup_fee", "monthly_management", "annual_review", "authorized_person",
      "consultant_name"
    ])
  },

  {
    name: "International Tax Services",
    servicePackage: "tax_compliance",
    bodyMd: `# INTERNATIONAL TAX SERVICES ENGAGEMENT

**Client:** {{client_name}}  
**Tax Advisor:** {{advisor_name}}  
**Date:** {{engagement_date}}

## 1. INTERNATIONAL TAX SERVICES

Comprehensive international tax services including:
- Double Tax Agreement application
- Transfer pricing documentation
- Controlled Foreign Company (CFC) rules
- Thin capitalization compliance
- Foreign tax credit claims
- Exchange control compliance

## 2. TRANSFER PRICING

Per Practice Note 7:
- Arm's length principle application
- Documentation requirements
- Benchmarking studies
- Country-by-country reporting
- Master file and local file

## 3. DTA RELIEF

- Treaty benefit applications
- Reduced withholding rates
- Permanent establishment analysis
- Mutual agreement procedures

## 4. PROFESSIONAL FEES

- Transfer pricing study: {{tp_study_fee}}
- DTA application: {{dta_fee}}
- CFC calculations: {{cfc_fee}}
- Hourly consultation: {{hourly_rate}}

**Client Agreement:**

Name: {{client_name}}  
Signature: ________________________  
Date: _______________

**Tax Advisor:**

Name: {{advisor_name}}  
International Tax Specialist
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "advisor_name", "engagement_date", "tp_study_fee",
      "dta_fee", "cfc_fee", "hourly_rate"
    ])
  },

  {
    name: "Tax Due Diligence Services",
    servicePackage: "tax_compliance",
    bodyMd: `# TAX DUE DILIGENCE ENGAGEMENT

**Target Company:** {{target_company}}  
**Client:** {{client_name}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. TAX DUE DILIGENCE SCOPE

Comprehensive tax review covering:
- Historical tax compliance review
- Tax risk assessment
- Contingent liability identification
- Tax structuring opportunities
- Warranty and indemnity advice

## 2. REVIEW AREAS

- Income tax (3-5 years)
- VAT compliance
- PAYE and employee taxes
- Transfer pricing
- Customs duties
- Pending disputes and audits

## 3. DELIVERABLES

- Tax due diligence report
- Red flag summary
- Tax risk matrix
- Estimated tax exposures
- Post-acquisition recommendations

## 4. PROFESSIONAL FEES

- Fixed fee: {{fixed_fee}}
- Scope changes: {{hourly_rate}} per hour
- Expedited service: {{expedite_premium}}% premium

## 5. CONFIDENTIALITY

Strict NDA compliance for all transaction information.

**Client Authorization:**

Company: {{client_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Lead Partner: {{lead_partner}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "target_company", "client_name", "provider_name", "engagement_date",
      "fixed_fee", "hourly_rate", "expedite_premium", "authorized_person",
      "lead_partner"
    ])
  },

  // ==========================================
  // AUDIT AND ASSURANCE SERVICES (10 templates)
  // ==========================================

  {
    name: "Statutory Audit Engagement - Large Company",
    servicePackage: "audit_services",
    bodyMd: `# STATUTORY AUDIT ENGAGEMENT LETTER

**Client:** {{company_name}}  
**Registration:** {{registration_number}}  
**Audit Firm:** {{audit_firm}}  
**Financial Year End:** {{year_end}}  
**Date:** {{engagement_date}}

## 1. AUDIT APPOINTMENT

We accept appointment as auditors in terms of Section 90 of the Companies Act 71 of 2008 and will conduct the audit in accordance with International Standards on Auditing (ISAs).

## 2. AUDIT OBJECTIVE

To express an opinion on whether the Annual Financial Statements:
- Present fairly in all material respects
- Comply with International Financial Reporting Standards (IFRS)
- Comply with the Companies Act requirements

## 3. MANAGEMENT RESPONSIBILITIES

Per ISA 210, management is responsible for:
- Preparation of AFS in accordance with IFRS
- Internal controls for reliable financial reporting
- Prevention and detection of fraud
- Compliance with laws and regulations
- Providing written representations

## 4. AUDITOR RESPONSIBILITIES

We will:
- Conduct audit per ISAs
- Maintain professional skepticism
- Obtain reasonable assurance
- Communicate significant findings
- Report on Companies Act requirements

## 5. AUDIT APPROACH

- Risk assessment procedures
- Internal control evaluation
- Substantive testing
- Analytical procedures
- Management discussions

## 6. REPORTING

Reports to be issued:
- Independent Auditor's Report
- Report on Other Legal Requirements
- Management Letter
- Reportable Irregularities (if any)

## 7. PROFESSIONAL FEES

Audit fee: {{audit_fee}} (excluding VAT)
Disbursements: {{disbursements}}
Total: {{total_fee}}
Payment terms: {{payment_terms}}

**Client Acceptance:**

Company: {{company_name}}  
Director: {{director_name}}  
Signature: ________________________  
Date: _______________

**Audit Firm:**

Firm: {{audit_firm}}  
Engagement Partner: {{partner_name}}  
IRBA Number: {{irba_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "registration_number", "audit_firm", "year_end",
      "engagement_date", "audit_fee", "disbursements", "total_fee",
      "payment_terms", "director_name", "partner_name", "irba_number"
    ])
  },

  {
    name: "Independent Review Engagement",
    servicePackage: "audit_services",
    bodyMd: `# INDEPENDENT REVIEW ENGAGEMENT LETTER

**Client:** {{company_name}}  
**Review Firm:** {{review_firm}}  
**Year End:** {{year_end}}  
**Date:** {{engagement_date}}

## 1. REVIEW ENGAGEMENT

We will perform an independent review per International Standard on Review Engagements (ISRE) 2400 (Revised).

## 2. REVIEW SCOPE

A review consists primarily of:
- Inquiries of management and others
- Analytical procedures
- Evaluating evidence obtained
- Limited assurance conclusion

## 3. LIMITATIONS

A review is NOT an audit:
- Substantially less in scope
- No opinion on financial statements
- Limited assurance only
- May not detect all material misstatements

## 4. MANAGEMENT RESPONSIBILITIES

Management must:
- Prepare complete AFS
- Provide all information requested
- Make written representations
- Disclose subsequent events

## 5. REVIEW PROCEDURES

- Inquiry and analytical review
- Comparison with prior periods
- Ratio analysis
- Trend analysis
- Reconciliation reviews

## 6. PROFESSIONAL FEES

Review fee: {{review_fee}}
Additional work: {{additional_rate}} per hour
Total estimate: {{total_estimate}}

**Client Agreement:**

Company: {{company_name}}  
Representative: {{client_rep}}  
Signature: ________________________  
Date: _______________

**Review Firm:**

Firm: {{review_firm}}  
Review Partner: {{review_partner}}  
CA(SA) Number: {{ca_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "review_firm", "year_end", "engagement_date",
      "review_fee", "additional_rate", "total_estimate", "client_rep",
      "review_partner", "ca_number"
    ])
  },

  {
    name: "Agreed-Upon Procedures Engagement",
    servicePackage: "audit_services",
    bodyMd: `# AGREED-UPON PROCEDURES ENGAGEMENT

**Client:** {{client_name}}  
**Service Provider:** {{provider_name}}  
**Subject Matter:** {{subject_matter}}  
**Date:** {{engagement_date}}

## 1. ENGAGEMENT SCOPE

We will perform agreed-upon procedures per International Standard on Related Services (ISRS) 4400.

## 2. PROCEDURES TO BE PERFORMED

{{procedure_1}}
{{procedure_2}}
{{procedure_3}}
{{procedure_4}}
{{procedure_5}}

## 3. FACTUAL FINDINGS REPORT

We will report factual findings without expressing assurance or opinion.

## 4. LIMITATIONS

- No audit or review performed
- No assurance provided
- Procedures limited to those agreed
- Report restricted to specified parties

## 5. PROFESSIONAL FEES

Fixed fee: {{fixed_fee}}
Additional procedures: {{additional_rate}} per hour

**Client Agreement:**

{{client_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Partner: {{partner_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "provider_name", "subject_matter", "engagement_date",
      "procedure_1", "procedure_2", "procedure_3", "procedure_4",
      "procedure_5", "fixed_fee", "additional_rate", "authorized_person",
      "partner_name"
    ])
  },

  {
    name: "Compilation Engagement",
    servicePackage: "audit_services",
    bodyMd: `# COMPILATION ENGAGEMENT LETTER

**Client:** {{client_name}}  
**Accountant:** {{accountant_name}}  
**Period:** {{financial_period}}  
**Date:** {{engagement_date}}

## 1. COMPILATION SERVICES

We will compile financial statements based on information provided by management per ISRS 4410.

## 2. NO ASSURANCE

Compilation provides NO assurance on financial statements. We will not:
- Audit the financial statements
- Review the financial statements
- Verify accuracy or completeness

## 3. MANAGEMENT RESPONSIBILITIES

You are responsible for:
- Accuracy of information provided
- Completeness of records
- All management decisions
- Financial statement content

## 4. OUR RESPONSIBILITIES

We will:
- Apply accounting expertise
- Prepare financial statements
- Note obvious material misstatements
- Attach compilation report

## 5. PROFESSIONAL FEES

Compilation fee: {{compilation_fee}}
Additional services: {{hourly_rate}} per hour

**Client Acknowledgment:**

{{client_name}}  
Representative: {{representative}}  
Signature: ________________________  
Date: _______________

**Accountant:**

{{accountant_name}}  
Professional Body Number: {{prof_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "accountant_name", "financial_period", "engagement_date",
      "compilation_fee", "hourly_rate", "representative", "prof_number"
    ])
  },

  {
    name: "Internal Audit Services",
    servicePackage: "audit_services",
    bodyMd: `# INTERNAL AUDIT SERVICES ENGAGEMENT

**Client:** {{company_name}}  
**Internal Audit Firm:** {{ia_firm}}  
**Service Period:** {{service_period}}  
**Date:** {{engagement_date}}

## 1. INTERNAL AUDIT SERVICES

We will provide internal audit services per the International Standards for the Professional Practice of Internal Auditing (IIA Standards).

## 2. SCOPE OF SERVICES

- Risk assessment and audit planning
- Operational audits
- Compliance audits
- Financial controls review
- IT audits
- Special investigations

## 3. AUDIT APPROACH

- Annual risk assessment
- Three-year rolling audit plan
- Quarterly audit committee reporting
- Management action tracking
- Continuous monitoring

## 4. DELIVERABLES

- Annual audit plan
- Individual audit reports
- Quarterly progress reports
- Annual opinion on controls
- Risk register updates

## 5. INDEPENDENCE

We maintain independence from:
- Management functions
- System implementations
- Operational responsibilities

## 6. PROFESSIONAL FEES

Annual retainer: {{annual_retainer}}
Additional investigations: {{investigation_rate}} per hour
Travel costs: Actual plus {{travel_markup}}%

**Client Agreement:**

Company: {{company_name}}  
Audit Committee Chair: {{ac_chair}}  
Signature: ________________________  
Date: _______________

**Internal Audit Firm:**

Firm: {{ia_firm}}  
Director: {{director_name}}  
CIA Number: {{cia_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "ia_firm", "service_period", "engagement_date",
      "annual_retainer", "investigation_rate", "travel_markup",
      "ac_chair", "director_name", "cia_number"
    ])
  },

  {
    name: "Forensic Audit Investigation",
    servicePackage: "audit_services",
    bodyMd: `# FORENSIC AUDIT ENGAGEMENT

**Client:** {{client_name}}  
**Forensic Firm:** {{forensic_firm}}  
**Matter:** {{investigation_matter}}  
**Date:** {{engagement_date}}

## 1. FORENSIC INVESTIGATION SCOPE

We will conduct a forensic investigation into {{investigation_matter}} including:
- Document examination
- Financial analysis
- Interview procedures
- Evidence gathering
- Quantification of losses

## 2. INVESTIGATION PROCEDURES

- Data analytics
- Transaction testing
- Asset tracing
- Background checks
- Lifestyle audits
- Digital forensics

## 3. REPORTING

Reports will include:
- Factual findings
- Evidence summary
- Loss quantification
- Recommendations
- Litigation support (if required)

## 4. CONFIDENTIALITY

Strict confidentiality maintained with limited disclosure to:
- Authorized client representatives
- Legal counsel
- Law enforcement (if required)

## 5. PROFESSIONAL FEES

Senior forensic specialist: {{senior_rate}}/hour
Forensic accountant: {{accountant_rate}}/hour
Data analyst: {{analyst_rate}}/hour
Retainer required: {{retainer_amount}}

## 6. LEGAL PRIVILEGE

Work performed under legal professional privilege where applicable.

**Client Authorization:**

{{client_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Forensic Firm:**

{{forensic_firm}}  
CFE/Director: {{cfe_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "forensic_firm", "investigation_matter", "engagement_date",
      "senior_rate", "accountant_rate", "analyst_rate", "retainer_amount",
      "authorized_person", "cfe_name"
    ])
  },

  {
    name: "IT Systems Audit",
    servicePackage: "audit_services",
    bodyMd: `# IT SYSTEMS AUDIT ENGAGEMENT

**Client:** {{client_name}}  
**IT Audit Firm:** {{audit_firm}}  
**Systems Scope:** {{systems_scope}}  
**Date:** {{engagement_date}}

## 1. IT AUDIT OBJECTIVES

Assessment of IT controls per COBIT framework:
- IT general controls
- Application controls
- Cybersecurity assessment
- Data integrity
- Business continuity

## 2. AUDIT SCOPE

Systems to be reviewed:
- {{system_1}}
- {{system_2}}
- {{system_3}}
- Network infrastructure
- Database management

## 3. CONTROL AREAS

- Access controls
- Change management
- Data backup and recovery
- Incident management
- Segregation of duties
- System development lifecycle

## 4. DELIVERABLES

- IT control assessment report
- Vulnerability assessment
- Risk rating matrix
- Remediation roadmap
- Executive summary

## 5. PROFESSIONAL FEES

IT audit fee: {{it_audit_fee}}
Vulnerability testing: {{vulnerability_fee}}
Total engagement: {{total_engagement_fee}}

**Client Agreement:**

{{client_name}}  
IT Manager: {{it_manager}}  
Signature: ________________________  
Date: _______________

**IT Audit Firm:**

{{audit_firm}}  
CISA/Partner: {{cisa_partner}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "audit_firm", "systems_scope", "engagement_date",
      "system_1", "system_2", "system_3", "it_audit_fee",
      "vulnerability_fee", "total_engagement_fee", "it_manager", "cisa_partner"
    ])
  },

  {
    name: "B-BBEE Verification Services",
    servicePackage: "audit_services",
    bodyMd: `# B-BBEE VERIFICATION ENGAGEMENT

**Entity:** {{entity_name}}  
**Verification Agency:** {{agency_name}}  
**SANAS Number:** {{sanas_number}}  
**Date:** {{engagement_date}}

## 1. VERIFICATION SCOPE

B-BBEE verification per the Broad-Based Black Economic Empowerment Act 53 of 2003:
- Ownership analysis
- Management control assessment
- Skills development verification
- Enterprise and supplier development
- Socio-economic development

## 2. APPLICABLE CODES

Verification per:
- Generic Codes of Good Practice
- Sector Code: {{sector_code}}
- QSE or EME status determination

## 3. VERIFICATION PROCEDURES

- Document review and testing
- Site visits and inspections
- Beneficiary verification
- Financial record examination
- Management representations

## 4. DELIVERABLES

- B-BBEE Certificate (valid 12 months)
- Verification report
- Scorecard breakdown
- Improvement recommendations

## 5. PROFESSIONAL FEES

Verification fee by turnover:
- EME (< R10m): {{eme_fee}}
- QSE (R10m-R50m): {{qse_fee}}
- Generic (> R50m): {{generic_fee}}

**Entity Agreement:**

Entity: {{entity_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Verification Agency:**

Agency: {{agency_name}}  
Technical Signatory: {{technical_signatory}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "entity_name", "agency_name", "sanas_number", "engagement_date",
      "sector_code", "eme_fee", "qse_fee", "generic_fee",
      "authorized_person", "technical_signatory"
    ])
  },

  {
    name: "Compliance Audit Services",
    servicePackage: "audit_services",
    bodyMd: `# COMPLIANCE AUDIT ENGAGEMENT

**Client:** {{client_name}}  
**Audit Firm:** {{audit_firm}}  
**Compliance Area:** {{compliance_area}}  
**Date:** {{engagement_date}}

## 1. COMPLIANCE AUDIT SCOPE

We will perform a compliance audit to assess adherence to:
- Regulatory requirements
- Industry standards
- Internal policies
- Contractual obligations
- Legal requirements

## 2. SPECIFIC AREAS

Compliance review of:
- {{compliance_item_1}}
- {{compliance_item_2}}
- {{compliance_item_3}}
- {{compliance_item_4}}

## 3. AUDIT METHODOLOGY

- Compliance framework assessment
- Control testing
- Substantive procedures
- Gap analysis
- Remediation planning

## 4. REPORTING

- Compliance audit report
- Non-compliance register
- Risk assessment
- Action plan
- Certificate of compliance (if applicable)

## 5. PROFESSIONAL FEES

Compliance audit: {{audit_fee}}
Remediation support: {{remediation_rate}}/hour
Annual monitoring: {{monitoring_fee}}

**Client Authorization:**

{{client_name}}  
Compliance Officer: {{compliance_officer}}  
Signature: ________________________  
Date: _______________

**Audit Firm:**

{{audit_firm}}  
Partner: {{partner_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "audit_firm", "compliance_area", "engagement_date",
      "compliance_item_1", "compliance_item_2", "compliance_item_3",
      "compliance_item_4", "audit_fee", "remediation_rate", "monitoring_fee",
      "compliance_officer", "partner_name"
    ])
  },

  {
    name: "Special Purpose Audit",
    servicePackage: "audit_services",
    bodyMd: `# SPECIAL PURPOSE AUDIT ENGAGEMENT

**Client:** {{client_name}}  
**Audit Firm:** {{audit_firm}}  
**Special Purpose:** {{special_purpose}}  
**Date:** {{engagement_date}}

## 1. SPECIAL PURPOSE AUDIT

We will conduct an audit for the specific purpose of {{special_purpose}} in accordance with applicable standards.

## 2. AUDIT SCOPE

Limited to:
- {{scope_item_1}}
- {{scope_item_2}}
- {{scope_item_3}}

## 3. REPORTING BASIS

Financial information prepared per:
- {{reporting_framework}}
- Special purpose framework
- Contractual requirements

## 4. REPORT RESTRICTIONS

Our report will be:
- Restricted to specified users
- Not for general distribution
- For the stated purpose only

## 5. PROFESSIONAL FEES

Fixed fee: {{fixed_fee}}
Scope changes: {{change_rate}}/hour
Expedited service: {{expedite_surcharge}}

**Client Agreement:**

{{client_name}}  
Representative: {{client_representative}}  
Signature: ________________________  
Date: _______________

**Audit Firm:**

{{audit_firm}}  
Engagement Partner: {{engagement_partner}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "audit_firm", "special_purpose", "engagement_date",
      "scope_item_1", "scope_item_2", "scope_item_3", "reporting_framework",
      "fixed_fee", "change_rate", "expedite_surcharge", "client_representative",
      "engagement_partner"
    ])
  },

  // ==========================================
  // BOOKKEEPING AND ACCOUNTING (8 templates)
  // ==========================================

  {
    name: "Full Bookkeeping Services",
    servicePackage: "bookkeeping",
    bodyMd: `# COMPREHENSIVE BOOKKEEPING SERVICES AGREEMENT

**Client:** {{client_name}}  
**Registration:** {{company_registration}}  
**Service Provider:** {{provider_name}}  
**Commencement:** {{start_date}}  
**Date:** {{engagement_date}}

## 1. BOOKKEEPING SERVICES

Complete bookkeeping services including:
- Transaction recording and classification
- Bank and credit card reconciliations
- Accounts receivable management
- Accounts payable processing
- Fixed asset register maintenance
- Inventory tracking
- Monthly financial statements

## 2. SERVICE LEVELS

Processing frequency: {{processing_frequency}}
Bank reconciliations: {{recon_frequency}}
Financial statements: {{statement_frequency}}
Management meetings: {{meeting_schedule}}

## 3. SOFTWARE AND SYSTEMS

Accounting software: {{accounting_software}}
Cloud access: {{cloud_access_details}}
Data backup: Daily automated backups
Integration: {{integrated_systems}}

## 4. CLIENT OBLIGATIONS

You must provide:
- Source documents by {{document_deadline}}
- Bank statements within {{bank_deadline}} days
- Approval for payments over {{approval_threshold}}
- Annual stock counts
- Timely query responses

## 5. DELIVERABLES

Monthly package includes:
- Trial Balance
- Income Statement
- Balance Sheet
- Cash Flow Statement
- Aged analysis reports
- Management accounts commentary
- KPI dashboard

## 6. PROFESSIONAL FEES

Monthly service fee: {{monthly_fee}}
Year-end support: {{yearend_fee}}
Additional services: {{hourly_rate}}/hour
Annual agreement discount: {{discount_percentage}}%

## 7. SERVICE STANDARDS

- Accuracy: 99.5% transaction accuracy
- Timeliness: Reports by {{report_deadline}} monthly
- Support: {{support_hours}} business hours
- Query response: Within {{response_time}} hours

**Service Agreement:**

Client: {{client_name}}  
Authorized Signatory: {{signatory_name}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

Provider: {{provider_name}}  
Account Manager: {{account_manager}}  
SAIPA Number: {{saipa_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "company_registration", "provider_name", "start_date",
      "engagement_date", "processing_frequency", "recon_frequency",
      "statement_frequency", "meeting_schedule", "accounting_software",
      "cloud_access_details", "integrated_systems", "document_deadline",
      "bank_deadline", "approval_threshold", "monthly_fee", "yearend_fee",
      "hourly_rate", "discount_percentage", "report_deadline", "support_hours",
      "response_time", "signatory_name", "account_manager", "saipa_number"
    ])
  },

  {
    name: "Management Accounts Preparation",
    servicePackage: "bookkeeping",
    bodyMd: `# MANAGEMENT ACCOUNTS SERVICES

**Client:** {{client_name}}  
**Accountant:** {{accountant_name}}  
**Reporting Period:** {{reporting_period}}  
**Date:** {{engagement_date}}

## 1. MANAGEMENT ACCOUNTING SERVICES

Preparation of detailed management accounts including:
- Monthly profit and loss analysis
- Departmental performance reports
- Budget vs actual comparisons
- Variance analysis
- Cash flow forecasts
- Working capital analysis
- Key ratio calculations

## 2. REPORTING STRUCTURE

- Executive summary dashboard
- Detailed P&L by division/department
- Balance sheet movements
- Cash position and forecasts
- Debtor and creditor aging
- Inventory analysis
- Capital expenditure tracking

## 3. PERFORMANCE METRICS

KPIs tracked:
- Gross profit margins
- Operating expenses ratios
- Working capital days
- Cash conversion cycle
- Return on assets
- Debt service coverage

## 4. MEETING SCHEDULE

Monthly management meeting: {{meeting_date}}
Quarterly board pack: {{board_date}}
Annual budget session: {{budget_date}}

## 5. PROFESSIONAL FEES

Monthly management accounts: {{monthly_ma_fee}}
Quarterly board pack: {{board_pack_fee}}
Annual budget preparation: {{budget_prep_fee}}

**Client Agreement:**

{{client_name}}  
CFO/Financial Manager: {{financial_manager}}  
Signature: ________________________  
Date: _______________

**Accountant:**

{{accountant_name}}  
CIMA/SAIPA Number: {{professional_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "accountant_name", "reporting_period", "engagement_date",
      "meeting_date", "board_date", "budget_date", "monthly_ma_fee",
      "board_pack_fee", "budget_prep_fee", "financial_manager",
      "professional_number"
    ])
  },

  {
    name: "Accounts Receivable Management",
    servicePackage: "bookkeeping",
    bodyMd: `# ACCOUNTS RECEIVABLE MANAGEMENT SERVICES

**Client:** {{client_name}}  
**Service Provider:** {{provider_name}}  
**Commencement:** {{start_date}}  
**Date:** {{engagement_date}}

## 1. DEBTORS MANAGEMENT SERVICES

Comprehensive accounts receivable management:
- Customer invoicing
- Credit control procedures
- Collection activities
- Payment allocation
- Customer statement preparation
- Dispute resolution
- Bad debt management

## 2. CREDIT CONTROL PROCESS

Day 0: Invoice issued
Day {{reminder_1}}: First reminder
Day {{reminder_2}}: Second reminder  
Day {{reminder_3}}: Final demand
Day {{handover}}: Legal handover

## 3. REPORTING

Weekly reports:
- Aged analysis
- Collection forecast
- Overdue accounts
- Dispute register

Monthly reports:
- Days Sales Outstanding (DSO)
- Bad debt provision
- Customer payment behavior
- Collection effectiveness

## 4. PERFORMANCE TARGETS

- DSO target: {{dso_target}} days
- Collection rate: {{collection_target}}%
- Bad debt ratio: < {{bad_debt_target}}%

## 5. PROFESSIONAL FEES

Management fee: {{management_percentage}}% of collections
Minimum monthly fee: {{minimum_fee}}
Legal handover coordination: {{legal_coordination_fee}}

**Service Agreement:**

Client: {{client_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Credit Manager: {{credit_manager}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "provider_name", "start_date", "engagement_date",
      "reminder_1", "reminder_2", "reminder_3", "handover", "dso_target",
      "collection_target", "bad_debt_target", "management_percentage",
      "minimum_fee", "legal_coordination_fee", "authorized_person",
      "credit_manager"
    ])
  },

  {
    name: "Accounts Payable Services",
    servicePackage: "bookkeeping",
    bodyMd: `# ACCOUNTS PAYABLE MANAGEMENT SERVICES

**Client:** {{client_name}}  
**Service Provider:** {{provider_name}}  
**Effective Date:** {{effective_date}}  
**Date:** {{engagement_date}}

## 1. CREDITORS MANAGEMENT SERVICES

Complete accounts payable management:
- Supplier invoice processing
- Payment run preparation
- Vendor reconciliations
- Expense claim processing
- Payment approval workflow
- Supplier statement reconciliation
- Query resolution

## 2. PAYMENT PROCESSES

- Invoice capture and coding
- Three-way matching
- Approval routing
- Payment file preparation
- Remittance advice dispatch
- Foreign payment processing

## 3. CONTROLS

- Duplicate payment prevention
- Vendor master maintenance
- Payment authorization matrix
- Monthly reconciliations
- Audit trail maintenance

## 4. SERVICE LEVELS

- Invoice processing: {{processing_time}} days
- Query resolution: {{query_time}} hours
- Payment accuracy: {{accuracy_target}}%
- On-time payments: {{ontime_target}}%

## 5. PROFESSIONAL FEES

Per invoice processed: {{per_invoice_fee}}
Minimum monthly fee: {{minimum_monthly}}
Payment run fee: {{payment_run_fee}}
Supplier onboarding: {{onboarding_fee}} each

**Client Authorization:**

{{client_name}}  
Finance Manager: {{finance_manager}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
AP Manager: {{ap_manager}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "provider_name", "effective_date", "engagement_date",
      "processing_time", "query_time", "accuracy_target", "ontime_target",
      "per_invoice_fee", "minimum_monthly", "payment_run_fee",
      "onboarding_fee", "finance_manager", "ap_manager"
    ])
  },

  {
    name: "Financial Statement Preparation",
    servicePackage: "bookkeeping",
    bodyMd: `# FINANCIAL STATEMENT PREPARATION SERVICES

**Client:** {{client_name}}  
**Accountant:** {{accountant_firm}}  
**Year End:** {{year_end}}  
**Date:** {{engagement_date}}

## 1. AFS PREPARATION SERVICES

Annual Financial Statement preparation per:
- International Financial Reporting Standards (IFRS)
- IFRS for SMEs
- Modified cash basis
- Companies Act disclosure requirements

## 2. STATEMENTS TO BE PREPARED

- Statement of Financial Position
- Statement of Comprehensive Income
- Statement of Changes in Equity
- Statement of Cash Flows
- Notes to Financial Statements
- Directors' Report
- Company Secretary Certificate

## 3. ACCOUNTING POLICIES

Application of:
- Revenue recognition (IFRS 15)
- Lease accounting (IFRS 16)
- Financial instruments (IFRS 9)
- Inventory valuation
- Depreciation methods
- Impairment assessments

## 4. CLIENT REQUIREMENTS

Please provide:
- Completed trial balance
- Supporting schedules
- Confirmations and reconciliations
- Related party information
- Subsequent event details
- Going concern assessment

## 5. PROFESSIONAL FEES

AFS preparation: {{afs_prep_fee}}
CIPC filing: {{cipc_filing_fee}}
Additional disclosures: {{additional_rate}}/hour

**Client Agreement:**

{{client_name}}  
Director: {{director_name}}  
Signature: ________________________  
Date: _______________

**Accountant:**

{{accountant_firm}}  
Professional Accountant: {{accountant_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "accountant_firm", "year_end", "engagement_date",
      "afs_prep_fee", "cipc_filing_fee", "additional_rate", "director_name",
      "accountant_name"
    ])
  },

  {
    name: "Virtual CFO Services",
    servicePackage: "bookkeeping",
    bodyMd: `# VIRTUAL CFO SERVICES AGREEMENT

**Client:** {{client_name}}  
**Virtual CFO Provider:** {{provider_name}}  
**Service Level:** {{service_level}}  
**Date:** {{engagement_date}}

## 1. VIRTUAL CFO SERVICES

Strategic financial leadership including:
- Financial strategy development
- Cash flow management
- Financial reporting oversight
- Board reporting
- Stakeholder management
- Funding and capital raising
- Financial system implementation

## 2. SERVICE DELIVERY

- On-site presence: {{onsite_days}} days per month
- Board meetings attendance
- 24/7 advisory availability
- Management team participation
- Investor relations support

## 3. KEY RESPONSIBILITIES

Strategic:
- Business planning and modeling
- M&A advisory
- Risk management
- Performance optimization

Operational:
- Month-end oversight
- Treasury management
- Tax planning
- Compliance monitoring

## 4. DELIVERABLES

- Monthly board pack
- Quarterly investor reports
- Annual budgets and forecasts
- Strategic initiatives tracking
- KPI dashboards

## 5. PROFESSIONAL FEES

Monthly retainer: {{monthly_retainer}}
Strategic projects: {{project_rate}}/hour
Capital raising success fee: {{success_fee}}%
Annual service agreement: {{annual_agreement}}

## 6. QUALIFICATIONS

Your Virtual CFO:
- CA(SA) qualified
- {{years_experience}} years experience
- Industry expertise: {{industry_expertise}}

**Service Agreement:**

Client: {{client_name}}  
CEO/MD: {{ceo_name}}  
Signature: ________________________  
Date: _______________

**Virtual CFO Provider:**

{{provider_name}}  
Lead CFO: {{lead_cfo_name}}  
CA(SA) Number: {{ca_sa_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "provider_name", "service_level", "engagement_date",
      "onsite_days", "monthly_retainer", "project_rate", "success_fee",
      "annual_agreement", "years_experience", "industry_expertise",
      "ceo_name", "lead_cfo_name", "ca_sa_number"
    ])
  },

  {
    name: "Budget Preparation Services",
    servicePackage: "bookkeeping",
    bodyMd: `# BUDGET PREPARATION SERVICES

**Client:** {{client_name}}  
**Consultant:** {{consultant_name}}  
**Budget Period:** {{budget_period}}  
**Date:** {{engagement_date}}

## 1. BUDGET SERVICES

Comprehensive budget preparation including:
- Revenue forecasting
- Expense budgeting
- Capital expenditure planning
- Cash flow projections
- Scenario modeling
- Variance analysis setup

## 2. BUDGET COMPONENTS

- Sales and revenue budget
- Operating expense budget
- Staff costs and headcount
- Marketing budget
- Capital budget
- Working capital requirements
- Financing needs

## 3. METHODOLOGY

- Historical trend analysis
- Market research integration
- Bottom-up/Top-down approach
- Zero-based budgeting options
- Rolling forecast capability

## 4. DELIVERABLES

- Master budget document
- Monthly phased budgets
- Department budgets
- Budget vs actual templates
- Executive presentation
- Board approval pack

## 5. PROFESSIONAL FEES

Budget preparation: {{budget_fee}}
Quarterly reviews: {{review_fee}}
Mid-year revision: {{revision_fee}}
Training and handover: {{training_fee}}

**Client Agreement:**

{{client_name}}  
CFO: {{cfo_name}}  
Signature: ________________________  
Date: _______________

**Consultant:**

{{consultant_name}}  
Qualifications: {{qualifications}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "consultant_name", "budget_period", "engagement_date",
      "budget_fee", "review_fee", "revision_fee", "training_fee",
      "cfo_name", "qualifications"
    ])
  },

  {
    name: "Cost Accounting Services",
    servicePackage: "bookkeeping",
    bodyMd: `# COST ACCOUNTING SERVICES ENGAGEMENT

**Client:** {{client_name}}  
**Cost Accountant:** {{accountant_name}}  
**Effective Date:** {{effective_date}}  
**Date:** {{engagement_date}}

## 1. COST ACCOUNTING SERVICES

Specialized cost accounting including:
- Product costing
- Job costing systems
- Activity-based costing
- Standard costing
- Variance analysis
- Profitability analysis
- Cost allocation methods

## 2. COSTING METHODOLOGY

Implementation of:
- Direct material tracking
- Direct labor allocation
- Manufacturing overhead absorption
- Cost center accounting
- Transfer pricing
- Break-even analysis

## 3. REPORTING

Cost reports including:
- Product profitability
- Customer profitability
- Production efficiency
- Waste and scrap analysis
- Capacity utilization
- Cost variance reports

## 4. SYSTEM INTEGRATION

- ERP integration
- Production system links
- Inventory tracking
- Time and attendance interface
- Automated cost allocation

## 5. PROFESSIONAL FEES

Setup and implementation: {{setup_fee}}
Monthly cost accounting: {{monthly_fee}}
Specialized analysis: {{analysis_rate}}/hour
Training: {{training_rate}}/day

**Client Agreement:**

{{client_name}}  
Operations Director: {{ops_director}}  
Signature: ________________________  
Date: _______________

**Cost Accountant:**

{{accountant_name}}  
CIMA Number: {{cima_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "accountant_name", "effective_date", "engagement_date",
      "setup_fee", "monthly_fee", "analysis_rate", "training_rate",
      "ops_director", "cima_number"
    ])
  },

  // ==========================================
  // PAYROLL SERVICES (5 templates)
  // ==========================================

  {
    name: "Complete Payroll Bureau Services",
    servicePackage: "payroll",
    bodyMd: `# PAYROLL BUREAU SERVICES AGREEMENT

**Employer:** {{employer_name}}  
**Registration:** {{company_registration}}  
**Payroll Provider:** {{provider_name}}  
**Commencement:** {{start_date}}  
**Date:** {{engagement_date}}

## 1. PAYROLL SERVICES

Comprehensive payroll services per South African labour law:
- Monthly/weekly salary processing
- PAYE, UIF, SDL calculations
- Medical aid and pension deductions
- Garnishee orders and loans
- Leave management
- Overtime and allowance calculations
- Commission and bonus processing

## 2. STATUTORY COMPLIANCE

Ensuring compliance with:
- Basic Conditions of Employment Act 75 of 1997
- Labour Relations Act 66 of 1995
- Employment Equity Act 55 of 1998
- Skills Development Act 97 of 1998
- Compensation for Occupational Injuries Act
- Income Tax Act (Fourth Schedule)

## 3. MONTHLY DELIVERABLES

- Payslips (electronic/printed)
- EMP201 submission
- Bank payment files (ACB format)
- PAYE/UIF/SDL payment advice
- Payroll summary reports
- Department cost allocations
- Leave liability reports

## 4. ANNUAL REQUIREMENTS

- IRP5/IT3(a) certificates
- EMP501 reconciliation
- WCA returns
- EEA2 and EEA4 submissions
- Skills development reports

## 5. SERVICE LEVELS

- Payroll cut-off: {{cutoff_date}} monthly
- Payslip delivery: {{payslip_date}}
- EMP201 submission: By 7th
- Query resolution: {{query_sla}} hours

## 6. PROFESSIONAL FEES

Setup fee: {{setup_fee}}
Per employee per month: {{per_employee_fee}}
Minimum monthly charge: {{minimum_charge}}
IRP5 certificates: {{irp5_fee}} per certificate
Additional runs: {{additional_run_fee}}

## 7. DATA SECURITY

- POPIA compliant processing
- Encrypted data transmission
- Secure cloud storage
- Access control protocols
- Regular backups

**Employer Agreement:**

Company: {{employer_name}}  
HR Director: {{hr_director}}  
Signature: ________________________  
Date: _______________

**Payroll Provider:**

{{provider_name}}  
Account Manager: {{account_manager}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "employer_name", "company_registration", "provider_name", "start_date",
      "engagement_date", "cutoff_date", "payslip_date", "query_sla",
      "setup_fee", "per_employee_fee", "minimum_charge", "irp5_fee",
      "additional_run_fee", "hr_director", "account_manager"
    ])
  },

  {
    name: "Expatriate Payroll Services",
    servicePackage: "payroll",
    bodyMd: `# EXPATRIATE PAYROLL SERVICES

**Employer:** {{employer_name}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. EXPAT PAYROLL SERVICES

Specialized expatriate payroll including:
- Split payroll processing
- Tax equalization calculations
- Foreign currency payments
- Shadow payroll maintenance
- Immigration compliance
- Double tax treaty application

## 2. TAX COMPLIANCE

Managing:
- South African tax obligations
- Foreign tax credits
- Tax equalization policies
- Hypothetical tax calculations
- Tax briefing documents
- Exit tax planning

## 3. ADDITIONAL SERVICES

- Cost of living adjustments
- Housing and education allowances
- Home leave provisions
- International medical coverage
- Pension fund transfers
- Exchange control compliance

## 4. REPORTING

- Multi-currency payslips
- Tax equalization statements
- Assignment cost projections
- Compliance reporting
- Year-end certificates (all jurisdictions)

## 5. PROFESSIONAL FEES

Per expatriate per month: {{expat_fee}}
Tax equalization setup: {{tax_equal_fee}}
Annual tax returns: {{tax_return_fee}}
Immigration support: {{immigration_fee}}

**Employer Agreement:**

{{employer_name}}  
Global Mobility Manager: {{mobility_manager}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Expat Specialist: {{specialist_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "employer_name", "provider_name", "engagement_date", "expat_fee",
      "tax_equal_fee", "tax_return_fee", "immigration_fee",
      "mobility_manager", "specialist_name"
    ])
  },

  {
    name: "Payroll Audit Services",
    servicePackage: "payroll",
    bodyMd: `# PAYROLL AUDIT ENGAGEMENT

**Client:** {{client_name}}  
**Auditor:** {{auditor_name}}  
**Audit Period:** {{audit_period}}  
**Date:** {{engagement_date}}

## 1. PAYROLL AUDIT SCOPE

Comprehensive payroll audit covering:
- PAYE compliance verification
- UIF and SDL calculations
- Overtime and leave calculations
- Benefits and deductions
- Statutory compliance
- Process and control review

## 2. AUDIT OBJECTIVES

- Verify calculation accuracy
- Ensure statutory compliance
- Identify overpayments/underpayments
- Review internal controls
- Assess fraud risks
- Recommend improvements

## 3. AUDIT PROCEDURES

- Sample testing of calculations
- Reconciliation reviews
- Statutory return verification
- Exception analysis
- System access review
- Documentation assessment

## 4. COMPLIANCE AREAS

- BCEA compliance
- Tax compliance
- Labour law adherence
- POPIA requirements
- Employment equity
- Skills development

## 5. DELIVERABLES

- Detailed audit report
- Compliance certificate
- Error quantification
- Recovery recommendations
- Process improvements
- Training requirements

## 6. PROFESSIONAL FEES

Payroll audit fee: {{audit_fee}}
Based on: {{employee_count}} employees
Additional testing: {{additional_rate}}/hour

**Client Authorization:**

{{client_name}}  
HR Director: {{hr_director}}  
Signature: ________________________  
Date: _______________

**Auditor:**

{{auditor_name}}  
Lead Auditor: {{lead_auditor}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "auditor_name", "audit_period", "engagement_date",
      "audit_fee", "employee_count", "additional_rate", "hr_director",
      "lead_auditor"
    ])
  },

  {
    name: "UIF Claims Administration",
    servicePackage: "payroll",
    bodyMd: `# UIF CLAIMS ADMINISTRATION SERVICES

**Client:** {{client_name}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. UIF SERVICES

Administration of UIF claims including:
- Unemployment benefits
- Illness benefits
- Maternity benefits
- Adoption benefits
- Dependents benefits
- Reduced work time benefits

## 2. CLAIM PROCESS

- Documentation preparation
- Online submission via uFiling
- Follow-up with Labour Department
- Employee assistance
- Appeal submissions
- Payment tracking

## 3. EMPLOYER OBLIGATIONS

Per Unemployment Insurance Act:
- Monthly UIF contributions
- UI-19 submissions
- Employee registration
- Termination notifications
- Record maintenance

## 4. SERVICE LEVELS

- Claim submission: Within {{submission_days}} days
- Query resolution: {{query_resolution}} hours
- Status updates: {{update_frequency}}
- Success rate target: {{success_target}}%

## 5. PROFESSIONAL FEES

Per claim submitted: {{per_claim_fee}}
Successful claim bonus: {{success_bonus}}
Appeals process: {{appeal_fee}}
Monthly retainer option: {{monthly_retainer}}

**Client Agreement:**

{{client_name}}  
HR Manager: {{hr_manager}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
UIF Specialist: {{specialist_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "provider_name", "engagement_date", "submission_days",
      "query_resolution", "update_frequency", "success_target",
      "per_claim_fee", "success_bonus", "appeal_fee", "monthly_retainer",
      "hr_manager", "specialist_name"
    ])
  },

  {
    name: "Workmen's Compensation Services",
    servicePackage: "payroll",
    bodyMd: `# WORKMEN'S COMPENSATION ADMINISTRATION

**Employer:** {{employer_name}}  
**COID Number:** {{coid_number}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. COID SERVICES

Compensation Fund administration per COIDA 130 of 1993:
- Annual ROE submissions
- Claims administration
- Accident reporting
- Medical aid management
- Compensation calculations
- Good standing certificates

## 2. COMPLIANCE REQUIREMENTS

- Annual assessment payments
- Wage declarations (W.As.8)
- Accident reporting (W.CL.2)
- First aid compliance
- Safety file maintenance
- IOD committee requirements

## 3. CLAIMS MANAGEMENT

- Incident investigation
- Medical report coordination
- Claim submission
- Progress monitoring
- Return to work programs
- Dispute resolution

## 4. ASSESSMENT CALCULATION

Based on:
- Annual earnings
- Risk classification
- Industry tariff
- Claims history
- Safety record

## 5. PROFESSIONAL FEES

Annual submission: {{annual_fee}}
Per claim managed: {{per_claim_fee}}
Good standing application: {{good_standing_fee}}
Assessment appeals: {{appeal_rate}}/hour

**Employer Agreement:**

{{employer_name}}  
Safety Officer: {{safety_officer}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
COID Specialist: {{coid_specialist}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "employer_name", "coid_number", "provider_name", "engagement_date",
      "annual_fee", "per_claim_fee", "good_standing_fee", "appeal_rate",
      "safety_officer", "coid_specialist"
    ])
  },

  // ==========================================
  // COMPANY SECRETARIAL (8 templates)
  // ==========================================

  {
    name: "Complete Company Secretarial Services",
    servicePackage: "cipc_compliance",
    bodyMd: `# COMPANY SECRETARIAL SERVICES AGREEMENT

**Company:** {{company_name}}  
**Registration:** {{registration_number}}  
**Secretary:** {{secretary_name}}  
**Date:** {{engagement_date}}

## 1. COMPANY SECRETARIAL SERVICES

Full compliance per Companies Act 71 of 2008:
- Annual return preparation and filing
- Director appointment/resignation
- Share transfers and allotments
- Registered address maintenance
- Minute book maintenance
- Statutory register updates
- MOI amendments

## 2. STATUTORY COMPLIANCE

Ensuring compliance with:
- Companies Act 71 of 2008
- Companies Regulations 2011
- King IV Corporate Governance
- JSE Listings Requirements (if applicable)
- Financial Markets Act

## 3. CORPORATE RECORDS

Maintenance of:
- Share register
- Directors register
- Secretary register
- Beneficial interest register
- Minutes of meetings
- Written resolutions
- Company seal (if applicable)

## 4. ANNUAL REQUIREMENTS

- Annual General Meeting coordination
- Annual return submission
- Financial statement filing
- Notice to file AFS
- Solvency and liquidity tests
- Director declarations

## 5. MEETING SERVICES

- AGM and board meeting notices
- Agenda preparation
- Attendance registers
- Minute taking
- Resolution drafting
- Proxy forms

## 6. PROFESSIONAL FEES

Annual secretarial fee: {{annual_fee}}
Per board meeting: {{meeting_fee}}
Share transfers: {{transfer_fee}} each
CIPC filings: {{filing_fee}} plus disbursements

## 7. DEADLINES AND PENALTIES

- Annual return: Within 30 days of anniversary
- AFS filing: Within 30 days of AGM
- Late penalties: Avoided through proactive management

**Company Authorization:**

Company: {{company_name}}  
Director/CEO: {{director_name}}  
Signature: ________________________  
Date: _______________

**Company Secretary:**

{{secretary_name}}  
FCIS/Admission Number: {{admission_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "registration_number", "secretary_name", "engagement_date",
      "annual_fee", "meeting_fee", "transfer_fee", "filing_fee",
      "director_name", "admission_number"
    ])
  },

  {
    name: "CIPC Annual Return Services",
    servicePackage: "cipc_compliance",
    bodyMd: `# CIPC ANNUAL RETURN SERVICES

**Company:** {{company_name}}  
**Registration:** {{registration_number}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. ANNUAL RETURN SERVICES

CIPC annual return compliance including:
- Company information verification
- Director details update
- Share capital confirmation
- Registered address verification
- Beneficial ownership disclosure
- Annual return submission

## 2. INFORMATION REQUIRED

- Current director details
- ID numbers and addresses
- Share register updates
- Financial year end confirmation
- Audit/review/compilation status
- Contact information updates

## 3. COMPLIANCE TIMELINE

Anniversary date: {{anniversary_date}}
Submission deadline: {{submission_deadline}}
Our processing date: {{processing_date}}
Safety buffer: 15 business days

## 4. PENALTIES AVOIDED

- Late filing: R100-R500
- Non-compliance: Deregistration risk
- Director personal liability
- Loss of good standing

## 5. PROFESSIONAL FEES

Annual return filing: {{filing_fee}}
Information updates: {{update_fee}}
Urgent submission: {{urgent_fee}}
Prior year catch-up: {{catchup_fee}} per year

**Company Agreement:**

{{company_name}}  
Authorized Representative: {{representative}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
CIPC Specialist: {{specialist}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "registration_number", "provider_name", "engagement_date",
      "anniversary_date", "submission_deadline", "processing_date",
      "filing_fee", "update_fee", "urgent_fee", "catchup_fee",
      "representative", "specialist"
    ])
  },

  {
    name: "Company Registration Services",
    servicePackage: "cipc_compliance",
    bodyMd: `# COMPANY REGISTRATION SERVICES

**Applicant:** {{applicant_name}}  
**Proposed Company:** {{proposed_name}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. REGISTRATION SERVICES

New company registration including:
- Name reservation
- MOI drafting (standard/customized)
- CIPC registration
- Tax registration
- Bank account assistance
- B-BBEE shareholding advice

## 2. COMPANY TYPES

Registration options:
- Private company (Pty) Ltd
- Public company Ltd
- Non-profit company NPC
- Personal liability company Inc
- State-owned company SOC

## 3. REGISTRATION REQUIREMENTS

- Minimum 1 director
- Registered address
- Company name approval
- Share capital structure
- MOI adoption
- Director consents

## 4. POST-REGISTRATION

Assistance with:
- Tax registration (income tax, VAT, PAYE)
- Bank account opening
- Share certificates
- Director appointments
- Company seal (optional)
- Statutory books

## 5. TIMELINE

- Name reservation: 1-2 days
- Registration: 3-5 days
- Tax registration: 7-21 days
- Total setup: {{total_timeline}}

## 6. PROFESSIONAL FEES

Name reservation: {{name_fee}}
Company registration: {{registration_fee}}
Customized MOI: {{moi_fee}}
Tax registrations: {{tax_reg_fee}}
Total package: {{package_fee}}

**Applicant Agreement:**

{{applicant_name}}  
ID Number: {{id_number}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Consultant: {{consultant_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "applicant_name", "proposed_name", "provider_name", "engagement_date",
      "total_timeline", "name_fee", "registration_fee", "moi_fee",
      "tax_reg_fee", "package_fee", "id_number", "consultant_name"
    ])
  },

  {
    name: "Share Transfer Services",
    servicePackage: "cipc_compliance",
    bodyMd: `# SHARE TRANSFER SERVICES

**Company:** {{company_name}}  
**Registration:** {{registration_number}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. SHARE TRANSFER SERVICES

Processing share transfers including:
- Share purchase agreements
- Transfer documentation (CM2A)
- Securities transfer tax
- Share certificates
- Register updates
- Beneficial ownership changes

## 2. TRANSFER REQUIREMENTS

- Board/shareholder approval
- Pre-emptive rights compliance
- MOI restrictions check
- Solvency and liquidity test
- Fair value determination
- Tax clearance (if required)

## 3. DOCUMENTATION

- Share transfer forms
- Share purchase agreement
- Board resolutions
- Tax calculations
- Updated share register
- New certificates

## 4. TAX IMPLICATIONS

- Securities transfer tax (0.25%)
- Capital gains tax
- Dividends tax considerations
- Section 42 rollovers
- Value shifting provisions

## 5. TIMELINE

Standard transfer: {{standard_timeline}}
Complex transfer: {{complex_timeline}}
CIPC notification: Within 10 days

## 6. PROFESSIONAL FEES

Simple transfer: {{simple_fee}}
Complex transfer: {{complex_fee}}
STT calculation: {{stt_fee}}
Agreement drafting: {{agreement_fee}}

**Company Authorization:**

{{company_name}}  
Company Secretary: {{secretary}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Transfer Secretary: {{transfer_secretary}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "registration_number", "provider_name", "engagement_date",
      "standard_timeline", "complex_timeline", "simple_fee", "complex_fee",
      "stt_fee", "agreement_fee", "secretary", "transfer_secretary"
    ])
  },

  {
    name: "Director Appointment Services",
    servicePackage: "cipc_compliance",
    bodyMd: `# DIRECTOR APPOINTMENT SERVICES

**Company:** {{company_name}}  
**New Director:** {{director_name}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. APPOINTMENT SERVICES

Director appointment process:
- Eligibility verification
- Consent documentation
- Board resolution
- CIPC filing (CoR39)
- Register updates
- Induction materials

## 2. DIRECTOR REQUIREMENTS

Eligibility criteria:
- Not disqualified (s69)
- Not insolvent
- Not prohibited by court
- Consent provided
- ID/passport verified

## 3. FIDUCIARY DUTIES

Directors bound by:
- Duty of care and skill
- Good faith obligations
- Conflict of interest rules
- Company best interests
- Statutory obligations

## 4. DOCUMENTATION

- Director consent (CoR39)
- Board resolution
- ID verification
- Qualification verification
- Declaration of interests
- Induction pack

## 5. PROFESSIONAL FEES

Appointment service: {{appointment_fee}}
CIPC filing: {{filing_fee}}
Induction materials: {{induction_fee}}
Multiple appointments: {{multiple_discount}}% discount

**Company Authorization:**

{{company_name}}  
Chairman/CEO: {{chairman_ceo}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Company Secretary: {{company_secretary}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "director_name", "provider_name", "engagement_date",
      "appointment_fee", "filing_fee", "induction_fee", "multiple_discount",
      "chairman_ceo", "company_secretary"
    ])
  },

  {
    name: "MOI Amendment Services",
    servicePackage: "cipc_compliance",
    bodyMd: `# MOI AMENDMENT SERVICES

**Company:** {{company_name}}  
**Registration:** {{registration_number}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. MOI AMENDMENT SERVICES

Memorandum of Incorporation amendments:
- Drafting amendments
- Special resolution preparation
- Shareholder approval
- CIPC filing
- Notice of Amendment

## 2. COMMON AMENDMENTS

- Share capital changes
- Director powers
- Shareholder rights
- Meeting procedures
- Restriction modifications
- Object clause updates

## 3. APPROVAL REQUIREMENTS

- Special resolution (75%)
- Board recommendation
- Shareholder meeting
- Notice period (15 days)
- Quorum requirements

## 4. FILING PROCESS

- Notice of Amendment (CoR15.2)
- Amended MOI
- Special resolution
- Filing fee payment
- CIPC processing

## 5. TIMELINE

- Draft preparation: {{draft_days}} days
- Notice period: 15 business days
- CIPC filing: {{filing_days}} days
- Total process: {{total_days}} days

## 6. PROFESSIONAL FEES

MOI review and drafting: {{drafting_fee}}
Meeting coordination: {{meeting_fee}}
CIPC filing: {{cipc_fee}}
Complex amendments: {{complex_rate}}/hour

**Company Authorization:**

{{company_name}}  
Director: {{director_name}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Legal Advisor: {{legal_advisor}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "registration_number", "provider_name", "engagement_date",
      "draft_days", "filing_days", "total_days", "drafting_fee",
      "meeting_fee", "cipc_fee", "complex_rate", "director_name",
      "legal_advisor"
    ])
  },

  {
    name: "Company Restoration Services",
    servicePackage: "cipc_compliance",
    bodyMd: `# COMPANY RESTORATION SERVICES

**Deregistered Company:** {{company_name}}  
**Former Registration:** {{old_registration}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. RESTORATION SERVICES

Company restoration process:
- Deregistration reason assessment
- Outstanding compliance resolution
- CIPC application (CoR40.5)
- Court application (if required)
- Re-registration

## 2. RESTORATION GROUNDS

Valid reasons:
- Company carrying on business
- Assets to be recovered
- Legal proceedings pending
- Incorrect deregistration
- Public interest

## 3. REQUIREMENTS

- All annual returns filed
- Outstanding fees paid
- AFS submissions complete
- Tax clearance obtained
- Affidavit provided

## 4. COURT APPLICATION

When required:
- Over 2 years deregistered
- Objections exist
- Complex circumstances

Process includes:
- Founding affidavit
- Supporting documents
- Court appearance
- Order implementation

## 5. TIMELINE

CIPC restoration: {{cipc_timeline}}
Court restoration: {{court_timeline}}
Post-restoration compliance: {{compliance_timeline}}

## 6. PROFESSIONAL FEES

CIPC application: {{cipc_app_fee}}
Court application: {{court_app_fee}}
Outstanding filings: {{filing_rate}} each
Success fee: {{success_fee}}

**Applicant Agreement:**

Applicant: {{applicant_name}}  
Former Director: {{former_director}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Attorney/Specialist: {{specialist_name}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "company_name", "old_registration", "provider_name", "engagement_date",
      "cipc_timeline", "court_timeline", "compliance_timeline",
      "cipc_app_fee", "court_app_fee", "filing_rate", "success_fee",
      "applicant_name", "former_director", "specialist_name"
    ])
  },

  {
    name: "Trust Registration and Administration",
    servicePackage: "cipc_compliance",
    bodyMd: `# TRUST REGISTRATION AND ADMINISTRATION

**Trust Name:** {{trust_name}}  
**Service Provider:** {{provider_name}}  
**Date:** {{engagement_date}}

## 1. TRUST SERVICES

Complete trust services:
- Trust deed drafting
- Master's Office registration
- Trustee appointments
- Letters of Authority
- Annual administration
- Beneficiary management

## 2. TRUST TYPES

- Family trust
- Business trust
- Testamentary trust
- Special trust (Type A/B)
- Charitable trust
- Educational trust

## 3. REGISTRATION PROCESS

- Trust deed preparation
- Trustee acceptance
- Master's Office filing
- Trust number allocation
- Bank account opening
- Tax registration

## 4. ONGOING ADMINISTRATION

- Trustee meetings
- Distribution decisions
- Beneficiary records
- Investment management
- Tax compliance
- Annual accountings

## 5. COMPLIANCE

- Trust Property Control Act
- Income Tax Act
- Estate Duty Act
- Master's Office requirements
- FICA compliance

## 6. PROFESSIONAL FEES

Trust deed drafting: {{deed_fee}}
Registration: {{registration_fee}}
Annual administration: {{annual_admin_fee}}
Tax services: {{tax_service_fee}}
Trustee meetings: {{meeting_fee}}

**Client Agreement:**

Founder/Trustee: {{founder_trustee}}  
ID Number: {{id_number}}  
Signature: ________________________  
Date: _______________

**Service Provider:**

{{provider_name}}  
Trust Specialist: {{trust_specialist}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "trust_name", "provider_name", "engagement_date", "deed_fee",
      "registration_fee", "annual_admin_fee", "tax_service_fee",
      "meeting_fee", "founder_trustee", "id_number", "trust_specialist"
    ])
  },

  // ==========================================
  // ADVISORY SERVICES (10 templates)
  // ==========================================

  {
    name: "Tax Planning and Advisory",
    servicePackage: "advisory_services",
    bodyMd: `# TAX PLANNING AND ADVISORY SERVICES

**Client:** {{client_name}}  
**Tax Advisor:** {{advisor_name}}  
**Engagement Period:** {{engagement_period}}  
**Date:** {{engagement_date}}

## 1. TAX ADVISORY SERVICES

Strategic tax planning including:
- Tax structure optimization
- Transaction tax planning
- International tax planning
- Estate planning
- Tax risk management
- Legislative updates

## 2. PLANNING AREAS

- Corporate restructuring
- M&A tax planning
- Group tax optimization
- Transfer pricing strategies
- Expatriate tax planning
- Succession planning

## 3. TAX OPINIONS

Written opinions on:
- Tax treatment of transactions
- GAAR application
- Advance tax rulings
- Dispute resolution strategies
- Legislative interpretation

## 4. IMPLEMENTATION

- Structure implementation
- Documentation preparation
- SARS engagement
- Ruling applications
- Ongoing monitoring

## 5. PROFESSIONAL FEES

Hourly rates:
- Tax Partner: {{partner_rate}}/hour
- Tax Manager: {{manager_rate}}/hour
- Tax Consultant: {{consultant_rate}}/hour

Project basis:
- Fixed fee proposals available
- Success fees for tax savings

**Client Agreement:**

{{client_name}}  
Authorized Person: {{authorized_person}}  
Signature: ________________________  
Date: _______________

**Tax Advisor:**

{{advisor_name}}  
Tax Partner/Director  
SAIT Number: {{sait_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "advisor_name", "engagement_period", "engagement_date",
      "partner_rate", "manager_rate", "consultant_rate", "authorized_person",
      "sait_number"
    ])
  },

  {
    name: "Business Valuation Services",
    servicePackage: "advisory_services",
    bodyMd: `# BUSINESS VALUATION ENGAGEMENT

**Client:** {{client_name}}  
**Business:** {{business_name}}  
**Valuator:** {{valuator_name}}  
**Valuation Date:** {{valuation_date}}  
**Date:** {{engagement_date}}

## 1. VALUATION PURPOSE

Business valuation for:
{{valuation_purpose}}

## 2. VALUATION METHODOLOGY

Approaches to be used:
- Income approach (DCF)
- Market approach (multiples)
- Asset approach (NAV)
- Weighted combination

## 3. INFORMATION REQUIRED

- 3-5 years financial statements
- Management accounts
- Business plan/forecasts
- Customer contracts
- Asset registers
- Market analysis

## 4. VALUATION STANDARDS

Valuation performed per:
- International Valuation Standards
- SARS Practice Note 15
- Professional standards

## 5. DELIVERABLES

- Comprehensive valuation report
- Executive summary
- Supporting calculations
- Sensitivity analysis
- Fairness opinion (if required)

## 6. PROFESSIONAL FEES

Valuation fee: {{valuation_fee}}
Based on complexity and size
Additional opinions: {{opinion_fee}}
Court testimony: {{testimony_rate}}/day

## 7. LIMITATIONS

Valuation subject to:
- Information accuracy
- Market conditions
- Specific assumptions
- Valuation date

**Client Authorization:**

{{client_name}}  
Director/Owner: {{director_owner}}  
Signature: ________________________  
Date: _______________

**Valuator:**

{{valuator_name}}  
Chartered Accountant/CVA  
Registration: {{registration_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "business_name", "valuator_name", "valuation_date",
      "engagement_date", "valuation_purpose", "valuation_fee", "opinion_fee",
      "testimony_rate", "director_owner", "registration_number"
    ])
  },

  {
    name: "Mergers and Acquisitions Advisory",
    servicePackage: "advisory_services",
    bodyMd: `# M&A ADVISORY SERVICES ENGAGEMENT

**Client:** {{client_name}}  
**Transaction Type:** {{transaction_type}}  
**Advisor:** {{advisor_name}}  
**Date:** {{engagement_date}}

## 1. M&A ADVISORY SERVICES

Transaction advisory including:
- Buy-side advisory
- Sell-side advisory
- Valuation services
- Due diligence coordination
- Deal structuring
- Negotiation support

## 2. TRANSACTION PROCESS

- Target identification/buyer search
- Valuation and pricing
- Information memorandum
- Due diligence management
- SPA negotiation
- Closing coordination

## 3. DUE DILIGENCE

Coordinating:
- Financial due diligence
- Legal due diligence
- Tax due diligence
- Commercial due diligence
- Technical due diligence

## 4. DEAL STRUCTURING

- Transaction structure design
- Tax optimization
- Financing arrangements
- Earnout mechanisms
- Warranties and indemnities

## 5. PROFESSIONAL FEES

Success fee: {{success_percentage}}% of transaction value
Minimum fee: {{minimum_fee}}
Monthly retainer: {{monthly_retainer}}
Breakup fee: {{breakup_fee}}

## 6. CONFIDENTIALITY

Strict confidentiality and inside information protocols.

**Client Agreement:**

{{client_name}}  
CEO/Owner: {{ceo_owner}}  
Signature: ________________________  
Date: _______________

**M&A Advisor:**

{{advisor_name}}  
Managing Director  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "transaction_type", "advisor_name", "engagement_date",
      "success_percentage", "minimum_fee", "monthly_retainer", "breakup_fee",
      "ceo_owner"
    ])
  },

  {
    name: "Financial Restructuring Advisory",
    servicePackage: "advisory_services",
    bodyMd: `# FINANCIAL RESTRUCTURING ADVISORY

**Client:** {{client_name}}  
**Advisor:** {{advisor_name}}  
**Date:** {{engagement_date}}

## 1. RESTRUCTURING SERVICES

Financial restructuring including:
- Debt restructuring
- Business rescue support
- Turnaround planning
- Cash flow management
- Creditor negotiations
- Refinancing advisory

## 2. ASSESSMENT PHASE

- Financial position review
- Cash flow analysis
- Viability assessment
- Stakeholder mapping
- Options evaluation
- Action plan development

## 3. IMPLEMENTATION

- Creditor engagement
- Restructuring proposals
- Payment arrangements
- Asset realizations
- Cost reductions
- Working capital optimization

## 4. BUSINESS RESCUE

If required:
- Business rescue plan
- PCF appointment
- Creditor meetings
- Voting coordination
- Plan implementation

## 5. DELIVERABLES

- Restructuring plan
- Cash flow forecasts
- Creditor proposals
- Progress reports
- Stakeholder communications

## 6. PROFESSIONAL FEES

Initial assessment: {{assessment_fee}}
Monthly advisory: {{monthly_fee}}
Success fee: {{success_fee}}
Business rescue: {{rescue_fee}}

**Client Authorization:**

{{client_name}}  
Director: {{director_name}}  
Signature: ________________________  
Date: _______________

**Restructuring Advisor:**

{{advisor_name}}  
TMA-SA Member  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "advisor_name", "engagement_date", "assessment_fee",
      "monthly_fee", "success_fee", "rescue_fee", "director_name"
    ])
  },

  {
    name: "Risk Management Advisory",
    servicePackage: "advisory_services",
    bodyMd: `# RISK MANAGEMENT ADVISORY SERVICES

**Client:** {{client_name}}  
**Risk Advisor:** {{advisor_name}}  
**Date:** {{engagement_date}}

## 1. RISK ADVISORY SERVICES

Enterprise risk management:
- Risk assessment
- Risk framework development
- Control implementation
- Compliance programs
- Business continuity planning
- Insurance optimization

## 2. RISK ASSESSMENT

Identifying and evaluating:
- Strategic risks
- Operational risks
- Financial risks
- Compliance risks
- Reputational risks
- Cyber risks

## 3. FRAMEWORK DEVELOPMENT

- ERM framework design
- Risk appetite statements
- Risk policies
- Risk registers
- Heat maps
- KRI dashboards

## 4. IMPLEMENTATION

- Control design
- Process improvements
- Training programs
- Monitoring systems
- Incident management
- Reporting protocols

## 5. DELIVERABLES

- Risk assessment report
- Risk management framework
- Implementation roadmap
- Training materials
- Quarterly risk reports

## 6. PROFESSIONAL FEES

Risk assessment: {{assessment_fee}}
Framework development: {{framework_fee}}
Implementation support: {{implementation_rate}}/hour
Annual retainer: {{annual_retainer}}

**Client Agreement:**

{{client_name}}  
Chief Risk Officer: {{cro_name}}  
Signature: ________________________  
Date: _______________

**Risk Advisor:**

{{advisor_name}}  
Risk Management Professional  
IRM Certification: {{irm_cert}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "advisor_name", "engagement_date", "assessment_fee",
      "framework_fee", "implementation_rate", "annual_retainer",
      "cro_name", "irm_cert"
    ])
  },

  {
    name: "Forensic Investigation Services",
    servicePackage: "advisory_services",
    bodyMd: `# FORENSIC INVESTIGATION ENGAGEMENT

**Client:** {{client_name}}  
**Investigation Matter:** {{matter_description}}  
**Forensic Firm:** {{forensic_firm}}  
**Date:** {{engagement_date}}

## 1. INVESTIGATION SCOPE

Forensic investigation into:
- Fraud allegations
- Asset misappropriation
- Financial statement fraud
- Corruption and bribery
- Conflict of interest
- Regulatory breaches

## 2. INVESTIGATION METHODOLOGY

- Preliminary assessment
- Evidence preservation
- Document analysis
- Data analytics
- Interviews
- Asset tracing
- Report preparation

## 3. FORENSIC PROCEDURES

- Email and communication review
- Financial transaction analysis
- Lifestyle audits
- Background investigations
- Digital forensics
- Surveillance (if authorized)

## 4. REPORTING

- Investigation findings
- Evidence documentation
- Loss quantification
- Recommendations
- Litigation support
- Expert testimony

## 5. LEGAL CONSIDERATIONS

- Legal professional privilege
- Chain of custody
- Admissible evidence
- Criminal referrals
- Civil recovery

## 6. PROFESSIONAL FEES

Senior investigator: {{senior_rate}}/hour
Forensic analyst: {{analyst_rate}}/hour
Data specialist: {{data_rate}}/hour
Minimum retainer: {{retainer}}
Court appearance: {{court_rate}}/day

**Client Authorization:**

{{client_name}}  
Authorized Representative: {{auth_rep}}  
Signature: ________________________  
Date: _______________

**Forensic Firm:**

{{forensic_firm}}  
Lead Investigator: {{lead_investigator}}  
CFE Number: {{cfe_number}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "matter_description", "forensic_firm", "engagement_date",
      "senior_rate", "analyst_rate", "data_rate", "retainer", "court_rate",
      "auth_rep", "lead_investigator", "cfe_number"
    ])
  },

  {
    name: "IT Advisory and Digital Transformation",
    servicePackage: "advisory_services",
    bodyMd: `# IT ADVISORY SERVICES ENGAGEMENT

**Client:** {{client_name}}  
**IT Advisor:** {{advisor_name}}  
**Project:** {{project_name}}  
**Date:** {{engagement_date}}

## 1. IT ADVISORY SERVICES

Digital transformation advisory:
- IT strategy development
- System selection
- Implementation oversight
- Digital transformation
- Cybersecurity advisory
- Cloud migration

## 2. ASSESSMENT PHASE

- Current state analysis
- Gap identification
- Requirements gathering
- Solution architecture
- Vendor evaluation
- Business case development

## 3. IMPLEMENTATION SUPPORT

- Project governance
- Change management
- Testing coordination
- Training programs
- Go-live support
- Post-implementation review

## 4. SPECIFIC SERVICES

- ERP selection and implementation
- CRM optimization
- Data analytics platforms
- Automation opportunities
- Integration strategies
- IT governance frameworks

## 5. DELIVERABLES

- IT strategy document
- Implementation roadmap
- Vendor recommendations
- Project plans
- Risk assessments
- Benefits realization

## 6. PROFESSIONAL FEES

Strategy development: {{strategy_fee}}
Implementation oversight: {{oversight_rate}}/day
Change management: {{change_fee}}
Ongoing advisory: {{monthly_advisory}}

**Client Agreement:**

{{client_name}}  
IT Director/CIO: {{it_director}}  
Signature: ________________________  
Date: _______________

**IT Advisor:**

{{advisor_name}}  
Digital Transformation Specialist  
Certifications: {{certifications}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "advisor_name", "project_name", "engagement_date",
      "strategy_fee", "oversight_rate", "change_fee", "monthly_advisory",
      "it_director", "certifications"
    ])
  },

  {
    name: "Sustainability and ESG Advisory",
    servicePackage: "advisory_services",
    bodyMd: `# ESG ADVISORY SERVICES ENGAGEMENT

**Client:** {{client_name}}  
**ESG Advisor:** {{advisor_name}}  
**Date:** {{engagement_date}}

## 1. ESG ADVISORY SERVICES

Environmental, Social and Governance advisory:
- ESG strategy development
- Sustainability reporting
- Carbon footprint assessment
- Social impact measurement
- Governance frameworks
- Stakeholder engagement

## 2. ESG ASSESSMENT

- Materiality assessment
- Baseline measurement
- Peer benchmarking
- Gap analysis
- Risk identification
- Opportunity mapping

## 3. FRAMEWORK ALIGNMENT

Alignment with:
- UN SDGs
- GRI Standards
- SASB Standards
- TCFD recommendations
- King IV principles
- JSE Sustainability Disclosure

## 4. IMPLEMENTATION

- ESG policy development
- KPI framework
- Data collection systems
- Reporting processes
- Assurance readiness
- Training programs

## 5. REPORTING

- Sustainability report
- Integrated report sections
- TCFD disclosures
- Carbon disclosure
- Social impact report

## 6. PROFESSIONAL FEES

ESG assessment: {{assessment_fee}}
Strategy development: {{strategy_fee}}
Annual reporting: {{reporting_fee}}
Assurance preparation: {{assurance_fee}}

**Client Agreement:**

{{client_name}}  
Sustainability Officer: {{sustainability_officer}}  
Signature: ________________________  
Date: _______________

**ESG Advisor:**

{{advisor_name}}  
ESG Specialist  
GRI Certification: {{gri_cert}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "advisor_name", "engagement_date", "assessment_fee",
      "strategy_fee", "reporting_fee", "assurance_fee",
      "sustainability_officer", "gri_cert"
    ])
  },

  {
    name: "International Trade Advisory",
    servicePackage: "advisory_services",
    bodyMd: `# INTERNATIONAL TRADE ADVISORY SERVICES

**Client:** {{client_name}}  
**Trade Advisor:** {{advisor_name}}  
**Date:** {{engagement_date}}

## 1. TRADE ADVISORY SERVICES

International trade consulting:
- Import/export compliance
- Customs optimization
- Free trade agreements
- Transfer pricing
- VAT/GST planning
- Trade finance

## 2. COMPLIANCE SERVICES

- Customs classification
- Valuation methods
- Rules of origin
- Duty optimization
- Trade sanctions screening
- Export controls

## 3. TRADE FACILITATION

- AEO certification
- Bonded warehouses
- Duty suspensions
- Refund claims
- Preferential rates
- Trade agreements

## 4. DOCUMENTATION

- Import/export documentation
- Certificates of origin
- Permits and licenses
- Customs declarations
- Trade compliance manuals

## 5. PROFESSIONAL FEES

Compliance review: {{review_fee}}
Monthly retainer: {{monthly_retainer}}
Per declaration review: {{declaration_fee}}
Training workshop: {{training_fee}}/day

**Client Agreement:**

{{client_name}}  
Supply Chain Director: {{sc_director}}  
Signature: ________________________  
Date: _______________

**Trade Advisor:**

{{advisor_name}}  
International Trade Specialist  
Customs Accreditation: {{customs_accred}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "advisor_name", "engagement_date", "review_fee",
      "monthly_retainer", "declaration_fee", "training_fee",
      "sc_director", "customs_accred"
    ])
  },

  {
    name: "Succession and Estate Planning",
    servicePackage: "advisory_services",
    bodyMd: `# SUCCESSION AND ESTATE PLANNING SERVICES

**Client:** {{client_name}}  
**Estate Planner:** {{planner_name}}  
**Date:** {{engagement_date}}

## 1. ESTATE PLANNING SERVICES

Comprehensive estate planning:
- Will drafting and review
- Trust structuring
- Estate duty planning
- Business succession
- Offshore planning
- Family governance

## 2. PLANNING OBJECTIVES

- Wealth preservation
- Tax minimization
- Asset protection
- Family harmony
- Business continuity
- Philanthropic goals

## 3. ESTATE ANALYSIS

- Asset and liability review
- Estate duty calculation
- Liquidity assessment
- CGT implications
- Executor fees
- Trust tax planning

## 4. STRUCTURES

Implementing:
- Inter vivos trusts
- Testamentary trusts
- Buy-sell agreements
- Holding structures
- Offshore trusts
- Foundations

## 5. DOCUMENTATION

- Last will and testament
- Trust deeds
- Powers of attorney
- Living wills
- Shareholder agreements
- Succession plans

## 6. PROFESSIONAL FEES

Estate plan development: {{plan_fee}}
Will drafting: {{will_fee}}
Trust structuring: {{trust_fee}}
Annual review: {{review_fee}}
Fiduciary services: {{fiduciary_rate}}

**Client Agreement:**

{{client_name}}  
ID Number: {{id_number}}  
Signature: ________________________  
Date: _______________

**Estate Planner:**

{{planner_name}}  
FPSA/CFP Professional  
Registration: {{registration}}  
Signature: ________________________  
Date: _______________`,
    fields: JSON.stringify([
      "client_name", "planner_name", "engagement_date", "plan_fee",
      "will_fee", "trust_fee", "review_fee", "fiduciary_rate",
      "id_number", "registration"
    ])
  }
];

// Export type for use in other modules
export type ProfessionalTemplate = typeof SOUTH_AFRICAN_PROFESSIONAL_TEMPLATES[0];