// Professional Accounting & Tax Services for South Africa
// Comprehensive preloaded services for accounting practices

export const serviceCategories = [
  'Financial Statements',
  'VAT Services', 
  'Income Tax',
  'CIPC Services',
  'Payroll Services',
  'COIDA Services',
  'CIDB Services',
  'Bookkeeping',
  'Audit Services',
  'Compliance Services',
  'Business Advisory'
];

export const userRoles = [
  'super_admin',
  'company_admin',
  'manager',
  'accountant',
  'tax_practitioner',
  'auditor',
  'bookkeeper',
  'payroll_administrator',
  'compliance_officer'
];

export const complianceAuthorities = [
  'SARS',
  'CIPC',
  'DOL',
  'UIF',
  'COIDA',
  'CIDB',
  'Financial Sector Conduct Authority',
  'South African Reserve Bank'
];

export const accountingServicesData = [
  {
    id: 1,
    name: "Annual Financial Statements (AFS)",
    description: "Preparation of basic annual financial statements for small to medium entities, ensuring compliance with applicable financial reporting framework",
    category: "Financial Statements",
    complexity: "intermediate",
    active: true,
    suggestedPrice: {
      min: "8500",
      max: "15000", 
      unit: "annually"
    },
    frequency: "Annual",
    estimatedHours: 24,
    complianceDeadlines: ["Within 15 months of financial year-end"],
    linkedAuthority: "CIPC",
    requiredQualifications: ["Professional Accountant", "CPA(SA)", "CA(SA)"],
    roleAccess: ["accountant", "auditor", "company_admin", "super_admin"],
    workflowSteps: [
      "Collect trial balance and supporting schedules",
      "Review accounting records and prepare adjustments",
      "Prepare financial statements in IFRS format",
      "Management review and approval",
      "File with CIPC within required timeframe"
    ],
    linkedTasks: [
      "Trial balance reconciliation",
      "Fixed asset register update", 
      "Provision calculations",
      "CIPC filing"
    ]
  },
  {
    id: 2,
    name: "Professional Annual Financial Statements",
    description: "Full scope professional annual financial statements for larger entities with complex transactions, ensuring full IFRS compliance and professional presentation",
    category: "Financial Statements", 
    complexity: "advanced",
    active: true,
    suggestedPrice: {
      min: "25000",
      max: "65000",
      unit: "annually"
    },
    frequency: "Annual",
    estimatedHours: 80,
    complianceDeadlines: ["Within 15 months of financial year-end"],
    linkedAuthority: "CIPC",
    requiredQualifications: ["CA(SA)", "Professional Accountant"],
    roleAccess: ["accountant", "auditor", "company_admin", "super_admin"],
    workflowSteps: [
      "Comprehensive accounting records review",
      "Complex transaction analysis and treatment",
      "Full IFRS disclosure preparation",
      "Management letter and recommendations",
      "Professional filing and representation"
    ]
  },
  {
    id: 3,
    name: "VAT Registration",
    description: "VAT vendor registration with SARS for new businesses reaching the mandatory threshold or applying for voluntary registration",
    category: "VAT Services",
    complexity: "basic", 
    active: true,
    suggestedPrice: {
      min: "850",
      max: "1500",
      unit: "once-off"
    },
    frequency: "Once-off",
    estimatedHours: 3,
    complianceDeadlines: ["Within 21 business days of reaching threshold"],
    linkedAuthority: "SARS",
    requiredQualifications: ["Tax Practitioner", "Professional Accountant"],
    roleAccess: ["tax_practitioner", "accountant", "company_admin", "super_admin"],
    workflowSteps: [
      "Gather required supporting documents",
      "Complete VAT101 registration form",
      "Submit application via eFiling",
      "Follow up on application status",
      "Advise client on VAT compliance obligations"
    ]
  },
  {
    id: 4,
    name: "Monthly VAT Returns (VAT201)",
    description: "Preparation and submission of monthly VAT returns for entities with turnover exceeding R30 million annually",
    category: "VAT Services",
    complexity: "basic",
    active: true,
    suggestedPrice: {
      min: "450",
      max: "1200", 
      unit: "monthly"
    },
    frequency: "Monthly",
    estimatedHours: 4,
    complianceDeadlines: ["25th day of the month following the tax period"],
    linkedAuthority: "SARS",
    requiredQualifications: ["Tax Practitioner", "Professional Accountant"],
    roleAccess: ["tax_practitioner", "accountant", "bookkeeper", "company_admin", "super_admin"],
    workflowSteps: [
      "Reconcile VAT control accounts",
      "Verify input and output tax calculations", 
      "Complete VAT201 return",
      "Client review and approval",
      "Submit via eFiling before deadline"
    ]
  },
  {
    id: 5,
    name: "Bi-Monthly VAT Returns (VAT201)",
    description: "Preparation and submission of bi-monthly VAT returns for standard VAT vendors with turnover between R1.2m and R30m",
    category: "VAT Services", 
    complexity: "basic",
    active: true,
    suggestedPrice: {
      min: "650",
      max: "1800",
      unit: "bi-monthly"
    },
    frequency: "Bi-Monthly",
    estimatedHours: 6,
    complianceDeadlines: ["25th day of the month following the tax period end"],
    linkedAuthority: "SARS",
    requiredQualifications: ["Tax Practitioner", "Professional Accountant"],
    roleAccess: ["tax_practitioner", "accountant", "bookkeeper", "company_admin", "super_admin"],
    workflowSteps: [
      "Compile two months of transactions",
      "Reconcile VAT control accounts",
      "Calculate input and output tax",
      "Complete and review VAT201",
      "Submit return and make payment if required"
    ]
  },
  {
    id: 6,
    name: "Individual Income Tax Return (ITR12)",
    description: "Preparation and submission of individual income tax returns for employees, including medical aid, retirement fund contributions and other deductions",
    category: "Income Tax",
    complexity: "basic",
    active: true,
    suggestedPrice: {
      min: "450",
      max: "1200",
      unit: "annually" 
    },
    frequency: "Annual",
    estimatedHours: 3,
    complianceDeadlines: ["31 October for non-provisional taxpayers", "31 January for tax practitioners"],
    linkedAuthority: "SARS",
    requiredQualifications: ["Tax Practitioner"],
    roleAccess: ["tax_practitioner", "accountant", "company_admin", "super_admin"],
    workflowSteps: [
      "Collect IRP5, IT3(a) and supporting documents",
      "Capture income and deduction details",
      "Calculate tax liability and refund due",
      "Client review and electronic signature",
      "Submit return via eFiling"
    ]
  },
  {
    id: 7,
    name: "Company Income Tax Return (ITR14)",
    description: "Preparation and submission of company income tax returns, including calculation of normal tax, withholding taxes and deferred tax",
    category: "Income Tax",
    complexity: "intermediate",
    active: true,
    suggestedPrice: {
      min: "3500",
      max: "12500",
      unit: "annually"
    },
    frequency: "Annual", 
    estimatedHours: 16,
    complianceDeadlines: ["12 months after year-end"],
    linkedAuthority: "SARS",
    requiredQualifications: ["Tax Practitioner", "Professional Accountant"],
    roleAccess: ["tax_practitioner", "accountant", "company_admin", "super_admin"],
    workflowSteps: [
      "Obtain audited annual financial statements",
      "Prepare tax computation and reconciliation",
      "Complete ITR14 return with required schedules",
      "Calculate provisional tax for following year",
      "Submit return and pay tax liability"
    ]
  },
  {
    id: 8,
    name: "Provisional Tax Returns (IRP6)",
    description: "Calculation and submission of provisional tax payments for individuals and companies earning non-employment income",
    category: "Income Tax",
    complexity: "intermediate",
    active: true,
    suggestedPrice: {
      min: "450",
      max: "1800",
      unit: "bi-annually"
    },
    frequency: "Bi-Annual",
    estimatedHours: 4,
    complianceDeadlines: ["31 August (first payment)", "28 February (second payment)"],
    linkedAuthority: "SARS", 
    requiredQualifications: ["Tax Practitioner", "Professional Accountant"],
    roleAccess: ["tax_practitioner", "accountant", "company_admin", "super_admin"],
    workflowSteps: [
      "Estimate taxable income for current year",
      "Calculate provisional tax liability", 
      "Complete IRP6 return",
      "Submit return and make payment",
      "Maintain records for assessment purposes"
    ]
  },
  {
    id: 9,
    name: "Private Company Registration (CK1)",
    description: "Registration of new private companies with CIPC, including preparation of incorporation documents and initial compliance requirements",
    category: "CIPC Services",
    complexity: "basic",
    active: true,
    suggestedPrice: {
      min: "1200",
      max: "2500",
      unit: "once-off"
    },
    frequency: "Once-off",
    estimatedHours: 4,
    complianceDeadlines: ["No specific deadline"],
    linkedAuthority: "CIPC",
    requiredQualifications: ["Company Secretary", "Professional Accountant"],
    roleAccess: ["company_admin", "super_admin", "compliance_officer"],
    workflowSteps: [
      "Name reservation and approval",
      "Prepare memorandum of incorporation",
      "Complete incorporation application",
      "Submit documents to CIPC",
      "Obtain certificate of incorporation"
    ]
  },
  {
    id: 10,
    name: "CIPC Annual Returns",
    description: "Filing of annual returns with CIPC including company information updates, beneficial ownership and financial position",
    category: "CIPC Services",
    complexity: "basic",
    active: true,
    suggestedPrice: {
      min: "450",
      max: "1200",
      unit: "annually"
    },
    frequency: "Annual",
    estimatedHours: 3,
    complianceDeadlines: ["Within 30 business days after anniversary of incorporation"],
    linkedAuthority: "CIPC", 
    requiredQualifications: ["Company Secretary", "Professional Accountant"],
    roleAccess: ["company_admin", "super_admin", "compliance_officer"],
    workflowSteps: [
      "Update company information and shareholding",
      "Prepare beneficial ownership details",
      "Complete annual return form",
      "Client approval and sign-off",
      "Submit return and pay prescribed fee"
    ]
  },
  {
    id: 11,
    name: "Director Amendments/Resignations", 
    description: "Processing of director appointments, resignations and detail changes including CM1, CM2 and other prescribed forms",
    category: "CIPC Services",
    complexity: "basic",
    active: true,
    suggestedPrice: {
      min: "350",
      max: "850",
      unit: "per transaction"
    },
    frequency: "As Required",
    estimatedHours: 2,
    complianceDeadlines: ["Within 40 business days of change"],
    linkedAuthority: "CIPC",
    requiredQualifications: ["Company Secretary"],
    roleAccess: ["company_admin", "super_admin", "compliance_officer"],
    workflowSteps: [
      "Obtain board resolution for changes",
      "Complete prescribed CIPC forms",
      "Gather director consent documents",
      "Submit forms to CIPC",
      "Update company records"
    ]
  },
  {
    id: 12,
    name: "Company Name Reservations",
    description: "Reservation of company names with CIPC for new incorporations or name changes, including name availability searches",
    category: "CIPC Services",
    complexity: "basic", 
    active: true,
    suggestedPrice: {
      min: "150",
      max: "350",
      unit: "per name"
    },
    frequency: "As Required",
    estimatedHours: 1,
    complianceDeadlines: ["No specific deadline"],
    linkedAuthority: "CIPC",
    requiredQualifications: ["Company Secretary"],
    roleAccess: ["company_admin", "super_admin", "compliance_officer"],
    workflowSteps: [
      "Conduct name availability search",
      "Submit name reservation application",
      "Pay prescribed fees",
      "Obtain name reservation certificate",
      "Advise client on reserved name validity"
    ]
  },
  {
    id: 13,
    name: "Company Name Changes",
    description: "Processing of company name changes including special resolutions, amended MOI and CIPC filings",
    category: "CIPC Services",
    complexity: "intermediate",
    active: true,
    suggestedPrice: {
      min: "850",
      max: "2200",
      unit: "once-off"
    },
    frequency: "As Required",
    estimatedHours: 6,
    complianceDeadlines: ["Within 20 business days of special resolution"],
    linkedAuthority: "CIPC",
    requiredQualifications: ["Company Secretary", "Professional Accountant"],
    roleAccess: ["company_admin", "super_admin", "compliance_officer"],
    workflowSteps: [
      "Reserve new company name",
      "Prepare special resolution for name change",
      "Amend memorandum of incorporation",
      "File amendments with CIPC",
      "Update all company documentation"
    ]
  },
  {
    id: 14,
    name: "Auditor Appointments/Resignations",
    description: "Processing of auditor appointments and resignations including required notifications and compliance with audit regulations",
    category: "CIPC Services",
    complexity: "intermediate",
    active: true,
    suggestedPrice: {
      min: "450",
      max: "950",
      unit: "per transaction"
    },
    frequency: "As Required",
    estimatedHours: 3,
    complianceDeadlines: ["Various depending on transaction type"],
    linkedAuthority: "CIPC",
    requiredQualifications: ["Company Secretary", "Professional Accountant"],
    roleAccess: ["company_admin", "super_admin", "auditor"],
    workflowSteps: [
      "Verify auditor registration and eligibility",
      "Prepare appointment/resignation documentation",
      "Obtain necessary consents and notifications",
      "File required forms with CIPC",
      "Update audit committee and board records"
    ]
  },
  {
    id: 15,
    name: "Non-Profit Company Registration (NPC)",
    description: "Registration of non-profit companies for charitable, educational or community benefit purposes including constitutional documents",
    category: "CIPC Services",
    complexity: "intermediate",
    active: true,
    suggestedPrice: {
      min: "1500",
      max: "3500",
      unit: "once-off"
    },
    frequency: "Once-off",
    estimatedHours: 8,
    complianceDeadlines: ["No specific deadline"],
    linkedAuthority: "CIPC",
    requiredQualifications: ["Company Secretary", "Professional Accountant"],
    roleAccess: ["company_admin", "super_admin", "compliance_officer"],
    workflowSteps: [
      "Draft non-profit company constitution",
      "Prepare incorporation documents",
      "Submit NPC registration application",
      "Obtain incorporation certificate",
      "Advise on ongoing compliance requirements"
    ]
  }
];

// Service template for task/project automation
export const serviceTaskTemplates = {
  "Annual Financial Statements (AFS)": {
    projectName: "AFS Preparation {CLIENT_NAME} - {YEAR}",
    estimatedDuration: "21 days",
    milestones: [
      {
        name: "Documentation Gathering",
        deadline: "Day 5",
        tasks: ["Trial balance", "Fixed asset register", "Bank statements", "Supporting schedules"]
      },
      {
        name: "Preparation Phase", 
        deadline: "Day 15",
        tasks: ["Financial statements preparation", "Notes disclosure", "Management accounts"]
      },
      {
        name: "Review and Finalization",
        deadline: "Day 21", 
        tasks: ["Management review", "Final adjustments", "CIPC filing preparation"]
      }
    ]
  },
  "VAT Registration": {
    projectName: "VAT Registration - {CLIENT_NAME}",
    estimatedDuration: "10 days",
    milestones: [
      {
        name: "Documentation Phase",
        deadline: "Day 3",
        tasks: ["Gather supporting documents", "Complete VAT101 form"]
      },
      {
        name: "Submission Phase",
        deadline: "Day 5", 
        tasks: ["Submit eFiling application", "Follow up with SARS"]
      },
      {
        name: "Completion Phase",
        deadline: "Day 10",
        tasks: ["Receive VAT number", "Advise client on obligations"]
      }
    ]
  }
};

// Additional Professional Services (16-33) to complete the 33 services total
export const additionalProfessionalServices = [
  {
    id: 'financial-year-end-changes',
    name: 'Financial Year End Changes',
    category: 'Company Secretarial',
    complexity: 'intermediate',
    description: 'Change of financial year end for registered companies',
    estimatedHours: 4,
    pricingTier: 'standard',
    basePrice: { min: 850, max: 1350 },
    requiredQualifications: ['Professional Accountant', 'Company Secretary'],
    complianceRequirements: ['CIPC Filing', 'SARS Notification'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['accountant', 'bookkeeper', 'company_secretary']
  },
  {
    id: 'company-address-changes',
    name: 'Company Address Changes',
    category: 'Company Secretarial',
    complexity: 'basic',
    description: 'Registration of registered address or postal address changes',
    estimatedHours: 2,
    pricingTier: 'basic',
    basePrice: { min: 350, max: 750 },
    requiredQualifications: ['Company Secretary'],
    complianceRequirements: ['CIPC Notification'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: false
    },
    isActive: true,
    roleAccess: ['company_secretary', 'accountant']
  },
  {
    id: 'monthly-payroll-processing',
    name: 'Monthly Payroll Processing',
    category: 'Payroll Services',
    complexity: 'intermediate',
    description: 'Complete monthly payroll processing including UIF, SDL, PAYE',
    estimatedHours: 8,
    pricingTier: 'standard',
    basePrice: { min: 850, max: 1850 },
    requiredQualifications: ['Payroll Administrator', 'Professional Accountant'],
    complianceRequirements: ['SARS PAYE', 'UIF Submissions', 'SDL Returns'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['payroll_admin', 'accountant', 'bookkeeper']
  },
  {
    id: 'emp501-monthly-submissions',
    name: 'EMP501 Monthly Submissions',
    category: 'Payroll Services',
    complexity: 'intermediate',
    description: 'Monthly employee tax reconciliation and submissions to SARS',
    estimatedHours: 6,
    pricingTier: 'standard',
    basePrice: { min: 750, max: 1250 },
    requiredQualifications: ['Payroll Administrator', 'Professional Accountant'],
    complianceRequirements: ['SARS PAYE', 'EMP501 Filing'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['payroll_admin', 'accountant']
  },
  {
    id: 'emp502-annual-reconciliation',
    name: 'EMP502 Annual Reconciliation',
    category: 'Payroll Services',
    complexity: 'advanced',
    description: 'Annual employee tax reconciliation for SARS compliance',
    estimatedHours: 12,
    pricingTier: 'premium',
    basePrice: { min: 1500, max: 4500 },
    requiredQualifications: ['Professional Accountant', 'Tax Practitioner'],
    complianceRequirements: ['SARS PAYE', 'Annual Reconciliation'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['payroll_admin', 'accountant', 'tax_practitioner']
  },
  {
    id: 'brs101-tax-certificates',
    name: 'BRS101 Tax Certificates',
    category: 'Tax Compliance',
    complexity: 'basic',
    description: 'Application and processing of tax compliance certificates',
    estimatedHours: 3,
    pricingTier: 'standard',
    basePrice: { min: 450, max: 850 },
    requiredQualifications: ['Tax Practitioner', 'Professional Accountant'],
    complianceRequirements: ['SARS Application', 'Tax Compliance'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['tax_practitioner', 'accountant']
  },
  {
    id: 'coid-registration',
    name: 'COID Registration',
    category: 'Regulatory Compliance',
    complexity: 'intermediate',
    description: 'Registration with Compensation for Occupational Injuries and Diseases',
    estimatedHours: 5,
    pricingTier: 'standard',
    basePrice: { min: 850, max: 1450 },
    requiredQualifications: ['HR Specialist', 'Professional Accountant'],
    complianceRequirements: ['COID Registration', 'Risk Assessment'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['hr_specialist', 'accountant', 'compliance_officer']
  },
  {
    id: 'coid-annual-returns',
    name: 'COID Annual Returns',
    category: 'Regulatory Compliance',
    complexity: 'intermediate',
    description: 'Annual returns and compliance for occupational injuries and diseases',
    estimatedHours: 6,
    pricingTier: 'standard',
    basePrice: { min: 950, max: 1950 },
    requiredQualifications: ['HR Specialist', 'Professional Accountant'],
    complianceRequirements: ['COID Filing', 'Annual Assessment'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['hr_specialist', 'accountant', 'compliance_officer']
  },
  {
    id: 'ccir-registration-construction',
    name: 'CCIR Registration (Construction Industry)',
    category: 'Industry Specialist',
    complexity: 'advanced',
    description: 'Registration with Construction Industry Development Board',
    estimatedHours: 8,
    pricingTier: 'premium',
    basePrice: { min: 1500, max: 3500 },
    requiredQualifications: ['Industry Specialist', 'Professional Accountant'],
    complianceRequirements: ['CIDB Registration', 'Industry Compliance'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['industry_specialist', 'accountant']
  },
  {
    id: 'ccir-annual-returns',
    name: 'CCIR Annual Returns',
    category: 'Industry Specialist',
    complexity: 'advanced',
    description: 'Annual returns and compliance for Construction Industry Registration',
    estimatedHours: 10,
    pricingTier: 'premium',
    basePrice: { min: 1750, max: 3500 },
    requiredQualifications: ['Industry Specialist', 'Professional Accountant'],
    complianceRequirements: ['CIDB Filing', 'Annual Compliance'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['industry_specialist', 'accountant']
  },
  {
    id: 'basic-bookkeeping-services',
    name: 'Basic Bookkeeping Services',
    category: 'Bookkeeping Services',
    complexity: 'basic',
    description: 'Monthly bookkeeping including bank reconciliation and basic financial statements',
    estimatedHours: 20,
    pricingTier: 'standard',
    basePrice: { min: 1500, max: 4500 },
    requiredQualifications: ['Bookkeeper', 'Professional Accountant'],
    complianceRequirements: ['Monthly Reconciliation', 'Financial Records'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['bookkeeper', 'accountant']
  },
  {
    id: 'monthly-management-accounts',
    name: 'Monthly Management Accounts',
    category: 'Management Reporting',
    complexity: 'intermediate',
    description: 'Preparation of monthly management accounts and profit & loss statements',
    estimatedHours: 12,
    pricingTier: 'standard',
    basePrice: { min: 2500, max: 6500 },
    requiredQualifications: ['Professional Accountant', 'Management Accountant'],
    complianceRequirements: ['Management Reporting', 'Financial Analysis'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['accountant', 'management_accountant']
  },
  {
    id: 'statutory-audit',
    name: 'Statutory Audit',
    category: 'Audit Services',
    complexity: 'expert',
    description: 'Independent statutory audit of annual financial statements',
    estimatedHours: 80,
    pricingTier: 'enterprise',
    basePrice: { min: 25000, max: 150000 },
    requiredQualifications: ['Chartered Accountant', 'Registered Auditor'],
    complianceRequirements: ['Audit Standards', 'IRBA Compliance'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['auditor', 'chartered_accountant']
  },
  {
    id: 'independent-review',
    name: 'Independent Review',
    category: 'Audit Services',
    complexity: 'advanced',
    description: 'Independent review of annual financial statements',
    estimatedHours: 40,
    pricingTier: 'premium',
    basePrice: { min: 12000, max: 35000 },
    requiredQualifications: ['Professional Accountant', 'Chartered Accountant'],
    complianceRequirements: ['Review Standards', 'Professional Standards'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['accountant', 'chartered_accountant']
  },
  {
    id: 'b-bbee-certificate-applications',
    name: 'B-BBEE Certificate Applications',
    category: 'Transformation Services',
    complexity: 'advanced',
    description: 'Preparation and submission of B-BBEE certificate applications',
    estimatedHours: 25,
    pricingTier: 'premium',
    basePrice: { min: 8500, max: 18500 },
    requiredQualifications: ['B-BBEE Specialist', 'Professional Accountant'],
    complianceRequirements: ['B-BBEE Codes', 'Verification Requirements'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['b_bbee_specialist', 'accountant']
  },
  {
    id: 'popia-compliance-assessment',
    name: 'POPIA Compliance Assessment',
    category: 'Legal Compliance',
    complexity: 'advanced',
    description: 'Assessment of personal information and compliance with POPIA requirements',
    estimatedHours: 20,
    pricingTier: 'premium',
    basePrice: { min: 8500, max: 18500 },
    requiredQualifications: ['Legal Specialist', 'Compliance Officer'],
    complianceRequirements: ['POPIA Requirements', 'Data Protection'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['compliance_officer', 'legal_specialist']
  },
  {
    id: 'business-plan-preparation',
    name: 'Business Plan Preparation',
    category: 'Business Advisory',
    complexity: 'advanced',
    description: 'Comprehensive business plan preparation for funding or strategic purposes',
    estimatedHours: 40,
    pricingTier: 'premium',
    basePrice: { min: 8500, max: 25000 },
    requiredQualifications: ['Business Advisor', 'Management Consultant'],
    complianceRequirements: ['Financial Projections', 'Market Analysis'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['business_advisor', 'management_consultant']
  },
  {
    id: 'tax-planning-advisory',
    name: 'Tax Planning and Advisory',
    category: 'Tax Advisory',
    complexity: 'advanced',
    description: 'Strategic tax planning and advisory services for tax optimization',
    estimatedHours: 15,
    pricingTier: 'premium',
    basePrice: { min: 4500, max: 12500 },
    requiredQualifications: ['Tax Specialist', 'Tax Practitioner'],
    complianceRequirements: ['Tax Planning', 'Advisory Standards'],
    automationSettings: {
      autoReminders: true,
      emailNotifications: true,
      deadlineAlerts: true
    },
    isActive: true,
    roleAccess: ['tax_specialist', 'tax_practitioner']
  }
];

export default accountingServicesData;