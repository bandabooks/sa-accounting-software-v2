import { useQuery } from "@tanstack/react-query";

export function useVATStatus(companyId: number = 4) {
  const { data: vatSettings, isLoading } = useQuery({
    queryKey: [`/api/companies/${companyId}/vat-settings`],
  });

  return {
    isVATRegistered: vatSettings?.isVatRegistered || false,
    vatSettings,
    isLoading,
    shouldShowVATFields: vatSettings?.isVatRegistered || false
  };
}