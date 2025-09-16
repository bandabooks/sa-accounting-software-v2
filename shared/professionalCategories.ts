import { 
  Calculator, 
  FileText, 
  Shield, 
  Eye, 
  BookOpen, 
  Users, 
  Building2, 
  TrendingUp 
} from "lucide-react";

export interface ProfessionalCategory {
  value: string;
  label: string;
  description: string;
  icon: any;
  compliance: string[];
}

// Professional Service Categories for South African Accounting & Business Services
// Categories aligned with backend servicePackage values from contractTemplatesSeeder.ts
export const professionalCategories: ProfessionalCategory[] = [
  { 
    value: "tax_compliance", 
    label: "Tax Compliance", 
    description: "Income tax, VAT, and PAYE services", 
    icon: Calculator,
    compliance: ["SAIT", "SAIPA"]
  },
  { 
    value: "vat_compliance", 
    label: "VAT Compliance", 
    description: "VAT201 returns and VAT compliance services", 
    icon: FileText,
    compliance: ["SAIT", "SAIPA"]
  },
  { 
    value: "audit_services", 
    label: "Audit Services", 
    description: "Independent audit and assurance services", 
    icon: Shield,
    compliance: ["SAICA", "IRBA"]
  },
  { 
    value: "review_services", 
    label: "Review Services", 
    description: "Independent review engagements", 
    icon: Eye,
    compliance: ["SAICA", "IRBA"]
  },
  { 
    value: "bookkeeping", 
    label: "Bookkeeping Services", 
    description: "Transaction recording and financial reporting", 
    icon: BookOpen,
    compliance: ["SAIPA", "IAC"]
  },
  { 
    value: "payroll", 
    label: "Payroll Services", 
    description: "Salary administration and statutory compliance", 
    icon: Users,
    compliance: ["SAIPA"]
  },
  { 
    value: "compliance", 
    label: "CIPC Compliance", 
    description: "Company registration and annual return services", 
    icon: Building2,
    compliance: ["SAICA", "SAIPA"]
  },
  { 
    value: "advisory", 
    label: "Business Advisory", 
    description: "Strategic planning and business consulting", 
    icon: TrendingUp,
    compliance: ["SAICA", "SAIPA"]
  }
];

export const categoryColors = {
  tax_compliance: "bg-blue-50 text-blue-700 border-blue-200",
  vat_compliance: "bg-cyan-50 text-cyan-700 border-cyan-200",
  audit_services: "bg-red-50 text-red-700 border-red-200",
  review_services: "bg-orange-50 text-orange-700 border-orange-200",
  bookkeeping: "bg-green-50 text-green-700 border-green-200",
  payroll: "bg-yellow-50 text-yellow-700 border-yellow-200",
  compliance: "bg-indigo-50 text-indigo-700 border-indigo-200",
  advisory: "bg-purple-50 text-purple-700 border-purple-200"
};

export const complianceColors = {
  "SAICA": "bg-blue-600 text-white",
  "SAIPA": "bg-green-600 text-white", 
  "SAIT": "bg-purple-600 text-white",
  "IRBA": "bg-red-600 text-white",
  "IAC": "bg-orange-600 text-white",
  "FPI": "bg-pink-600 text-white"
};

// Legacy compliance colors for backward compatibility
export const legacyComplianceColors = {
  SAICA: "bg-blue-100 text-blue-800",
  SAIPA: "bg-green-100 text-green-800", 
  IRBA: "bg-purple-100 text-purple-800",
  SAIT: "bg-orange-100 text-orange-800",
  IAC: "bg-teal-100 text-teal-800",
  FPI: "bg-pink-100 text-pink-800"
};