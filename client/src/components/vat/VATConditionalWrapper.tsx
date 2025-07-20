import React from "react";
import { useVATStatus } from "@/hooks/useVATStatus";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface VATConditionalWrapperProps {
  children: React.ReactNode;
  showMessage?: boolean;
  fallbackMessage?: string;
}

export function VATConditionalWrapper({ 
  children, 
  showMessage = true,
  fallbackMessage = "VAT fields are hidden because this company is not VAT registered. Enable VAT registration in Settings to access VAT functionality."
}: VATConditionalWrapperProps) {
  const { shouldShowVATFields, isLoading } = useVATStatus();

  if (isLoading) {
    return null;
  }

  if (!shouldShowVATFields) {
    if (!showMessage) {
      return null;
    }
    
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm">{fallbackMessage}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Helper component for inline VAT field wrapping
export function VATFieldWrapper({ children }: { children: React.ReactNode }) {
  const { shouldShowVATFields } = useVATStatus();
  
  if (!shouldShowVATFields) {
    return null;
  }
  
  return <>{children}</>;
}