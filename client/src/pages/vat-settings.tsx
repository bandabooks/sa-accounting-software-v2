import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { VatStatusToggle } from '../components/vat-management/vat-status-toggle';

const VATSettings: React.FC = () => {
  const { data: activeCompany } = useQuery({
    queryKey: ['/api/companies/active']
  });

  const companyId = activeCompany?.id || 2;

  const { data: vatSettings } = useQuery({
    queryKey: ["/api/companies", companyId, "vat-settings"],
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">VAT Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Configure VAT registration and compliance settings</p>
      </div>
      
      <VatStatusToggle 
        companyId={companyId}
        initialSettings={vatSettings || {
          isVatRegistered: false,
          vatNumber: "",
          vatRegistrationDate: undefined,
          vatPeriodMonths: 2,
          vatSubmissionDay: 25
        }}
      />
    </div>
  );
};

export default VATSettings;