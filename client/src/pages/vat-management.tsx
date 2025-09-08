import { VatManagementPage } from "@/components/vat-management/vat-management-page";
import { useCompany } from "@/contexts/CompanyContext";

export default function VatManagement() {
  const { companyId } = useCompany();
  
  if (!companyId) {
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
      <VatManagementPage companyId={companyId} />
    </div>
  );
}