import { VatManagementPage } from "@/components/vat-management/vat-management-page";

export default function VatManagement() {
  return (
    <div className="container mx-auto px-4 py-8">
      <VatManagementPage companyId={2} />
    </div>
  );
}