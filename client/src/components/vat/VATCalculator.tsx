import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateVAT, formatCurrency, SA_VAT_TYPES } from "@shared/vat-utils";

interface VATCalculatorProps {
  amount: number;
  vatRate: number;
  isVATInclusive: boolean;
  onVATChange: (calculation: {
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
    vatRate: number;
    isVATInclusive: boolean;
  }) => void;
  showVATRateSelector?: boolean;
  companyDefaultRate?: number;
}

export function VATCalculator({
  amount,
  vatRate,
  isVATInclusive,
  onVATChange,
  showVATRateSelector = true,
  companyDefaultRate = 15
}: VATCalculatorProps) {
  const [calculation, setCalculation] = useState(() =>
    calculateVAT(amount, vatRate, isVATInclusive)
  );

  useEffect(() => {
    const newCalculation = calculateVAT(amount, vatRate, isVATInclusive);
    setCalculation(newCalculation);
    onVATChange({
      netAmount: newCalculation.netAmount,
      vatAmount: newCalculation.vatAmount,
      grossAmount: newCalculation.grossAmount,
      vatRate,
      isVATInclusive
    });
  }, [amount, vatRate, isVATInclusive, onVATChange]);

  const handleVATRateChange = (newRate: string) => {
    const rate = parseFloat(newRate);
    const newCalculation = calculateVAT(amount, rate, isVATInclusive);
    setCalculation(newCalculation);
    onVATChange({
      netAmount: newCalculation.netAmount,
      vatAmount: newCalculation.vatAmount,
      grossAmount: newCalculation.grossAmount,
      vatRate: rate,
      isVATInclusive
    });
  };

  const handleInclusiveToggle = (checked: boolean) => {
    const newCalculation = calculateVAT(amount, vatRate, checked);
    setCalculation(newCalculation);
    onVATChange({
      netAmount: newCalculation.netAmount,
      vatAmount: newCalculation.vatAmount,
      grossAmount: newCalculation.grossAmount,
      vatRate,
      isVATInclusive: checked
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">VAT Calculation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* VAT Rate Selector */}
        {showVATRateSelector && (
          <div className="space-y-2">
            <Label htmlFor="vat-rate">VAT Rate</Label>
            <Select value={vatRate.toString()} onValueChange={handleVATRateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select VAT rate" />
              </SelectTrigger>
              <SelectContent>
                {SA_VAT_TYPES.map((type) => (
                  <SelectItem key={type.code} value={type.rate.toString()}>
                    {type.name} ({type.rate}%)
                  </SelectItem>
                ))}
                <SelectItem value={companyDefaultRate.toString()}>
                  Company Default ({companyDefaultRate}%)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* VAT Inclusive/Exclusive Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="vat-inclusive">VAT Inclusive Pricing</Label>
          <Switch
            id="vat-inclusive"
            checked={isVATInclusive}
            onCheckedChange={handleInclusiveToggle}
          />
        </div>

        {/* Calculation Results */}
        <div className="space-y-2 border-t pt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Net Amount (excl. VAT):</span>
            <span className="font-medium">{formatCurrency(calculation.netAmount)}</span>
          </div>
          
          {vatRate > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">VAT ({vatRate}%):</span>
              <span className="font-medium">{formatCurrency(calculation.vatAmount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm font-semibold border-t pt-2">
            <span>Total Amount (incl. VAT):</span>
            <span>{formatCurrency(calculation.grossAmount)}</span>
          </div>
        </div>

        {/* Pricing Mode Indicator */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          {isVATInclusive 
            ? "Prices include VAT. VAT amount is extracted from the total."
            : "Prices exclude VAT. VAT is added to the base amount."
          }
        </div>
      </CardContent>
    </Card>
  );
}

interface VATSummaryProps {
  netTotal: number;
  vatTotal: number;
  grossTotal: number;
  className?: string;
}

export function VATSummary({ netTotal, vatTotal, grossTotal, className = "" }: VATSummaryProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal (excl. VAT):</span>
        <span className="font-medium">{formatCurrency(netTotal)}</span>
      </div>
      
      {vatTotal > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">VAT:</span>
          <span className="font-medium">{formatCurrency(vatTotal)}</span>
        </div>
      )}
      
      <div className="flex justify-between text-base font-semibold border-t pt-2">
        <span>Total (incl. VAT):</span>
        <span>{formatCurrency(grossTotal)}</span>
      </div>
    </div>
  );
}

interface VATLineItemProps {
  quantity: number;
  unitPrice: number;
  vatRate: number;
  isVATInclusive: boolean;
  onCalculationChange: (calculation: {
    netAmount: number;
    vatAmount: number;
    grossAmount: number;
  }) => void;
}

export function VATLineItem({
  quantity,
  unitPrice,
  vatRate,
  isVATInclusive,
  onCalculationChange
}: VATLineItemProps) {
  useEffect(() => {
    const lineTotal = quantity * unitPrice;
    const calculation = calculateVAT(lineTotal, vatRate, isVATInclusive);
    onCalculationChange({
      netAmount: calculation.netAmount,
      vatAmount: calculation.vatAmount,
      grossAmount: calculation.grossAmount
    });
  }, [quantity, unitPrice, vatRate, isVATInclusive, onCalculationChange]);

  const lineTotal = quantity * unitPrice;
  const calculation = calculateVAT(lineTotal, vatRate, isVATInclusive);

  return (
    <div className="text-xs space-y-1">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Net:</span>
        <span>{formatCurrency(calculation.netAmount)}</span>
      </div>
      {vatRate > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">VAT:</span>
          <span>{formatCurrency(calculation.vatAmount)}</span>
        </div>
      )}
      <div className="flex justify-between font-medium">
        <span>Total:</span>
        <span>{formatCurrency(calculation.grossAmount)}</span>
      </div>
    </div>
  );
}