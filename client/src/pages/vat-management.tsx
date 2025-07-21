import { useQuery } from "@tanstack/react-query";
import { VatManagementPage } from "@/components/vat-management/vat-management-page";

export default function VATManagement() {
  // Get active company from the API
  const { data: activeCompany } = useQuery({
    queryKey: ["/api/companies/active"],
  });

  const companyId = activeCompany?.id || 2;

  return <VatManagementPage companyId={companyId} />;
}