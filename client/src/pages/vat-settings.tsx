import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { VatStatusToggle } from '../components/vat-management/vat-status-toggle';
import { Loader2 } from 'lucide-react';

const VATSettings: React.FC = () => {
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = (activeCompany as any)?.id || 2;

  const { data: vatSettings, isLoading } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  // Show loading state while fetching VAT settings
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VAT Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Configure VAT registration and compliance settings</p>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VAT Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure VAT registration and compliance settings</p>
      </div>
      
      <VatStatusToggle 
        companyId={companyId}
        initialSettings={{
          isVatRegistered: (vatSettings as any)?.isVatRegistered || false,
          vatNumber: (vatSettings as any)?.vatNumber || "",
          vatRegistrationDate: (vatSettings as any)?.vatRegistrationDate || "",
          vatPeriodMonths: (vatSettings as any)?.vatPeriodMonths || 2,
          vatCategory: (vatSettings as any)?.vatCategory || "A",
          vatStartMonth: (vatSettings as any)?.vatStartMonth || 1,
          vatSubmissionDay: (vatSettings as any)?.vatSubmissionDay || 25,
          defaultVatCalculationMethod: (vatSettings as any)?.defaultVatCalculationMethod || "inclusive"
        }}
      />
    </div>
  );
};

export default VATSettings;