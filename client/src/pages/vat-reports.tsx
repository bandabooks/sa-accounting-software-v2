import VATReports from "@/components/vat-management/vat-reports";
import { useQuery } from "@tanstack/react-query";

export default function VATReportsPage() {
  const { data: activeCompany } = useQuery({
    queryKey: ["/api/companies/active"],
  });
  
  if (!activeCompany) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">VAT Reports</h1>
        <p className="text-gray-600">Generate comprehensive VAT reports with multi-format export capabilities</p>
      </div>
      <VATReports companyId={(activeCompany as any)?.id || 2} />
    </div>
  );
}