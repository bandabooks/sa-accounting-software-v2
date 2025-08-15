import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building, Calculator, Shield, Code, Users } from "lucide-react";

interface UserRole {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  recommendedPlan: 'trial' | 'starter' | 'professional' | 'enterprise';
  features: string[];
}

const userRoles: UserRole[] = [
  {
    id: "individual",
    title: "I'm an Individual",
    description: "Personal accounting and financial management",
    icon: <User className="h-8 w-8" />,
    color: "bg-blue-500",
    recommendedPlan: "starter",
    features: [
      "Personal invoicing & quotes",
      "Basic expense tracking", 
      "Simple financial reports",
      "VAT management (if registered)"
    ]
  },
  {
    id: "business_owner",
    title: "I'm a Business Owner", 
    description: "Complete business management solution",
    icon: <Building className="h-8 w-8" />,
    color: "bg-green-500",
    recommendedPlan: "professional",
    features: [
      "Full business operations",
      "Customer & supplier management",
      "Advanced financial reporting",
      "SARS integration & compliance"
    ]
  },
  {
    id: "tax_practitioner",
    title: "I'm a Tax Practitioner or Accountant",
    description: "Professional tax and compliance services",
    icon: <Calculator className="h-8 w-8" />,
    color: "bg-purple-500", 
    recommendedPlan: "professional",
    features: [
      "Professional service templates",
      "Client practice management",
      "Full SARS integration",
      "Compliance workflow automation"
    ]
  },
  {
    id: "auditor",
    title: "I'm an Auditor or Compliance Officer",
    description: "Audit and compliance management tools",
    icon: <Shield className="h-8 w-8" />,
    color: "bg-orange-500",
    recommendedPlan: "professional",
    features: [
      "Audit trail & documentation",
      "Compliance management suite",
      "Risk assessment tools",
      "Regulatory reporting"
    ]
  },
  {
    id: "developer",
    title: "I'm a Developer",
    description: "API access and integration tools",
    icon: <Code className="h-8 w-8" />,
    color: "bg-blue-600",
    recommendedPlan: "enterprise",
    features: [
      "Full API access",
      "Custom integrations",
      "Webhook support",
      "Developer documentation"
    ]
  },
  {
    id: "other",
    title: "Other / Custom Role",
    description: "Customized solution for your needs",
    icon: <Users className="h-8 w-8" />,
    color: "bg-gray-500",
    recommendedPlan: "trial",
    features: [
      "Flexible configuration",
      "Custom workflow setup",
      "Personalized onboarding",
      "Scalable solutions"
    ]
  }
];

interface UserRoleSelectorProps {
  onRoleSelect: (role: UserRole) => void;
  selectedRole?: string;
}

export default function UserRoleSelector({ onRoleSelect, selectedRole }: UserRoleSelectorProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose your role to get started</h2>
        <p className="text-gray-600">This helps us customize the platform for your specific needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userRoles.map((role) => (
          <Card
            key={role.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              selectedRole === role.id 
                ? 'border-blue-500 bg-blue-50' 
                : hoveredRole === role.id 
                  ? 'border-gray-300 shadow-md' 
                  : 'border-gray-200'
            }`}
            onMouseEnter={() => setHoveredRole(role.id)}
            onMouseLeave={() => setHoveredRole(null)}
            onClick={() => onRoleSelect(role)}
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className={`${role.color} text-white p-3 rounded-lg flex-shrink-0`}>
                  {role.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {role.description}
                  </p>
                  
                  {/* Key Features */}
                  <div className="space-y-1">
                    {role.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-gray-500">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 flex-shrink-0"></div>
                        {feature}
                      </div>
                    ))}
                  </div>

                  {/* Recommended Plan Badge */}
                  <div className="mt-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      role.recommendedPlan === 'trial' 
                        ? 'bg-green-100 text-green-800'
                        : role.recommendedPlan === 'starter'
                          ? 'bg-blue-100 text-blue-800'
                          : role.recommendedPlan === 'professional'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-purple-100 text-purple-800'
                    }`}>
                      Recommended: {role.recommendedPlan.charAt(0).toUpperCase() + role.recommendedPlan.slice(1)} Plan
                    </span>
                  </div>
                </div>
              </div>

              {selectedRole === role.id && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => onRoleSelect(role)}
                  >
                    Continue with {role.title.replace("I'm ", "")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>Don't worry - you can always change your plan and configuration later!</p>
      </div>
    </div>
  );
}