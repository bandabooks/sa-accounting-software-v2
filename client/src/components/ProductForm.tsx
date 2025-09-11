import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import { useCompany } from "@/contexts/CompanyContext";
import { useVATStatus } from "@/hooks/useVATStatus";
import CategorySelect from "@/components/CategorySelect";
import { AccountSelect } from "@/components/AccountSelect";
import type { ProductCategory } from "@shared/schema";

const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().optional(),
  categoryId: z.string().optional(),
  unitPrice: z.string().min(1, "Price is required"),
  costPrice: z.string().optional(),
  vatRate: z.string().optional(),
  incomeAccountId: z.string().min(1, "Income account is required"),
  expenseAccountId: z.string().min(1, "Expense account is required"),
  inventoryAccountId: z.string().optional(), // Only for products
  stockQuantity: z.number().optional(),
  minStockLevel: z.number().optional(),
  isService: z.boolean().default(false),
  vatInclusive: z.boolean().default(false),
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
  product?: any;
}

export default function ProductForm({ onSubmit, onCancel, isLoading, product }: ProductFormProps) {
  const { companyId } = useCompany();
  const { shouldShowVATFields } = useVATStatus();
  const [showSKU, setShowSKU] = useState(false);

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["/api/product-categories"],
  });

  // Load accounts with proper field normalization
  const { data: accounts = [] } = useQuery<any[]>({
    queryKey: ["/api/chart-of-accounts"],
    select: (data) => data.map((account) => ({
      id: account.id,
      accountCode: account.accountCode || account.code,
      accountName: account.accountName || account.name,
      accountType: account.accountType || account.type,
    }))
  });

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      sku: product?.sku || "",
      unitPrice: product?.unitPrice ? product.unitPrice.toString() : "0.00",
      costPrice: product?.costPrice ? product.costPrice.toString() : "0.00",
      vatRate: product?.vatRate ? product.vatRate.toString() : "15.00",
      incomeAccountId: product?.incomeAccountId ? product.incomeAccountId.toString() : "",
      expenseAccountId: product?.expenseAccountId ? product.expenseAccountId.toString() : "",
      inventoryAccountId: product?.inventoryAccountId ? product.inventoryAccountId.toString() : "",
      stockQuantity: product?.stockQuantity || 0,
      minStockLevel: product?.minStockLevel || 0,
      isService: product?.isService || false,
      vatInclusive: product?.vatInclusive || false,
      categoryId: product?.categoryId ? product.categoryId.toString() : "",
    },
  });

  const isService = form.watch("isService");
  const unitPrice = parseFloat(form.watch("unitPrice") || "0");
  const costPrice = parseFloat(form.watch("costPrice") || "0");
  const vatRate = parseFloat(form.watch("vatRate") || "15");
  const vatInclusive = form.watch("vatInclusive");

  // Get ALL accounts by type - More inclusive filtering
  const getRevenueAccounts = () => {
    return accounts.filter(acc => {
      const accountType = (acc.accountType || '').toLowerCase();
      const accountName = (acc.accountName || '').toLowerCase();
      
      return accountType.includes('revenue') || 
             accountType.includes('income') ||
             accountName.includes('revenue') ||
             accountName.includes('income') ||
             accountName.includes('sales') ||
             accountName.includes('service') ||
             acc.accountCode?.startsWith('4'); // 4xxx accounts are typically revenue
    });
  };

  const getExpenseAccounts = () => {
    if (isService) {
      // For services, show ALL service-related expense accounts
      return accounts.filter(acc => {
        const accountType = (acc.accountType || '').toLowerCase();
        const accountName = (acc.accountName || '').toLowerCase();
        
        return accountType.includes('expense') ||
               accountName.includes('professional') ||
               accountName.includes('service') ||
               accountName.includes('consulting') ||
               accountName.includes('labor') ||
               accountName.includes('admin') ||
               acc.accountCode?.startsWith('6'); // 6xxx accounts are typically expenses
      });
    } else {
      // For products, show ALL cost of goods sold accounts
      return accounts.filter(acc => {
        const accountType = (acc.accountType || '').toLowerCase();
        const accountName = (acc.accountName || '').toLowerCase();
        
        return accountType.includes('cost') ||
               accountType.includes('cogs') ||
               accountName.includes('cost') ||
               accountName.includes('goods') ||
               accountName.includes('materials') ||
               accountName.includes('manufacturing') ||
               acc.accountCode?.startsWith('5'); // 5xxx accounts are typically COGS
      });
    }
  };

  const getInventoryAccounts = () => {
    return accounts.filter(acc => {
      const accountName = (acc.accountName || '').toLowerCase();
      const accountCode = acc.accountCode || '';
      
      // Only show inventory-specific asset accounts
      return accountName.includes('inventory') ||
             accountName.includes('stock') ||
             accountName.includes('finished goods') ||
             accountName.includes('raw materials') ||
             accountName.includes('work in progress') ||
             accountName.includes('goods for resale') ||
             accountName.includes('materials') ||
             accountCode.startsWith('120') || // 120x accounts are inventory
             (accountCode.startsWith('12') && accountName.includes('inventory'));
    });
  };

  // Calculate VAT and pricing
  const calculateVAT = () => {
    if (!unitPrice) return { exclVAT: 0, vatAmount: 0, inclVAT: 0 };
    
    if (vatInclusive) {
      const exclVAT = unitPrice / (1 + (vatRate / 100));
      const vatAmount = unitPrice - exclVAT;
      return { 
        exclVAT: parseFloat(exclVAT.toFixed(2)), 
        vatAmount: parseFloat(vatAmount.toFixed(2)), 
        inclVAT: unitPrice 
      };
    } else {
      const vatAmount = unitPrice * (vatRate / 100);
      const inclVAT = unitPrice + vatAmount;
      return { 
        exclVAT: unitPrice, 
        vatAmount: parseFloat(vatAmount.toFixed(2)), 
        inclVAT: parseFloat(inclVAT.toFixed(2)) 
      };
    }
  };

  // Calculate margin analysis
  const calculateMargins = () => {
    if (!unitPrice || !costPrice || costPrice === 0) return null;
    
    const profitMargin = ((unitPrice - costPrice) / unitPrice) * 100;
    const markupPercentage = ((unitPrice - costPrice) / costPrice) * 100;
    const profitAmount = unitPrice - costPrice;
    
    const vatCalc = calculateVAT();
    const profitAfterVAT = vatCalc.exclVAT - costPrice;
    const vatImpactOnProfit = profitAmount - profitAfterVAT;

    return {
      profitMargin: parseFloat(profitMargin.toFixed(1)),
      markupPercentage: parseFloat(markupPercentage.toFixed(1)),
      profitAmount: parseFloat(profitAmount.toFixed(2)),
      profitAfterVAT: parseFloat(profitAfterVAT.toFixed(2)),
      vatImpactOnProfit: parseFloat(vatImpactOnProfit.toFixed(2)),
    };
  };

  const vatCalc = calculateVAT();
  const margins = calculateMargins();

  const handleSubmit = (data: ProductFormData, e?: React.BaseSyntheticEvent) => {
    e?.preventDefault();
    const formattedData = {
      ...data,
      companyId: companyId || 0,
      categoryId: data.categoryId ? parseInt(data.categoryId) : undefined,
      incomeAccountId: parseInt(data.incomeAccountId),
      expenseAccountId: parseInt(data.expenseAccountId),
      inventoryAccountId: data.inventoryAccountId ? parseInt(data.inventoryAccountId) : undefined,
      // Keep prices as strings as expected by backend
      unitPrice: data.unitPrice,
      costPrice: data.costPrice || "0.00",
      vatRate: data.vatRate || "15.00",
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit(handleSubmit)(e);
      }} className="space-y-4" onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }}>
        {/* Product/Service Type & Name */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product/Service Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Consulting Service" {...field} data-testid="input-product-name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isService"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={(value) => field.onChange(value === "service")} value={field.value ? "service" : "product"}>
                  <FormControl>
                    <SelectTrigger data-testid="select-product-type">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="product">Product - Physical goods with inventory</SelectItem>
                    <SelectItem value="service">Service - Professional services or consulting</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SKU Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-sku"
              checked={showSKU}
              onCheckedChange={setShowSKU}
              data-testid="toggle-sku"
            />
            <Label htmlFor="show-sku" className="text-sm text-gray-600">Show SKU</Label>
          </div>

          {showSKU && (
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU/Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Auto-generated if empty" {...field} data-testid="input-sku" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description..." 
                  className="min-h-[60px] resize-none" 
                  {...field}
                  data-testid="textarea-description"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Pricing Section */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selling Price *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} data-testid="input-selling-price" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price (Optional)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} data-testid="input-cost-price" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* VAT Section */}
        {shouldShowVATFields && (
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="vat-inclusive"
                  checked={vatInclusive}
                  onCheckedChange={(checked) => form.setValue("vatInclusive", checked)}
                  data-testid="toggle-vat-inclusive"
                />
                <Label htmlFor="vat-inclusive" className="text-sm font-medium">VAT Inclusive Pricing</Label>
                <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">Active</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-gray-600">VAT Rate (%)</Label>
                <FormField
                  control={form.control}
                  name="vatRate"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-8" data-testid="select-vat-rate">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15.00">Standard VAT (15%) - Most goods and services</SelectItem>
                        <SelectItem value="0.00">Zero VAT (0%) - Exempt items</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Price (excl VAT):</span>
                  <span className="font-medium">R {vatCalc.exclVAT.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>VAT Amount:</span>
                  <span className="font-medium">R {vatCalc.vatAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold border-t pt-1">
                  <span>Total (incl VAT):</span>
                  <span>R {vatCalc.inclVAT.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Margin Analysis */}
        {margins && (
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Info className="h-4 w-4 text-blue-600" />
              <Label className="font-medium">Professional Margin Analysis</Label>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="flex justify-between">
                  <span>Selling Price:</span>
                  <span className="font-medium">R {unitPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cost Price:</span>
                  <span className="font-medium">R {costPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Profit Below Cost:</span>
                  <span>R {margins.profitAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between">
                  <span>Profit Margin:</span>
                  <span className="font-medium">{margins.profitMargin}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Markup %:</span>
                  <span className="font-medium">{margins.markupPercentage}%</span>
                </div>
                {shouldShowVATFields && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Profit after VAT:</span>
                      <span className="font-medium">R {margins.profitAfterVAT.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-blue-600 text-xs">
                      <span>VAT impact on profit:</span>
                      <span>R {margins.vatImpactOnProfit.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-xs text-gray-600 mt-2">
              Price includes VAT (VAT amount will be calculated from this total)
            </div>
          </div>
        )}

        {/* Account Mapping */}
        <div className="bg-blue-50 dark:bg-blue-950/10 p-4 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Info className="h-4 w-4 text-blue-600" />
            <Label className="font-medium">Account Mapping</Label>
          </div>
          <div className="text-xs text-blue-600 mb-3">
            Account mapping ensures compliance with IFRS and SA GAAP. Income accounts track revenue recognition, while expense accounts properly match costs to revenue periods.
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            <FormField
              control={form.control}
              name="incomeAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Income Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9" data-testid="select-income-account">
                        <SelectValue placeholder="Select income account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getRevenueAccounts().map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountCode} - {account.accountName}
                        </SelectItem>
                      ))}
                      {/* Show message if no accounts are found */}
                      {getRevenueAccounts().length === 0 && (
                        <SelectItem value="no-accounts" disabled className="text-gray-500">
                          No revenue accounts found - please create accounts first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expenseAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">
                    {isService ? "Service Cost Account" : "Cost of Sales Account"}
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9" data-testid="select-expense-account">
                        <SelectValue placeholder={`Select ${isService ? 'service cost' : 'cost of sales'} account`} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getExpenseAccounts().map((account) => (
                        <SelectItem key={account.id} value={account.id.toString()}>
                          {account.accountCode} - {account.accountName}
                        </SelectItem>
                      ))}
                      {/* Show message if no accounts are found */}
                      {getExpenseAccounts().length === 0 && (
                        <SelectItem value="no-accounts" disabled className="text-gray-500">
                          No {isService ? 'service cost' : 'cost of sales'} accounts found - please create accounts first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Inventory Asset Account - Only for Products */}
            {!isService && (
              <FormField
                control={form.control}
                name="inventoryAccountId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Inventory Asset Account</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9" data-testid="select-inventory-account">
                          <SelectValue placeholder="Select inventory asset account" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getInventoryAccounts().map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.accountCode} - {account.accountName}
                          </SelectItem>
                        ))}
                        {/* Show message if no accounts are found */}
                        {getInventoryAccounts().length === 0 && (
                          <SelectItem value="no-accounts" disabled className="text-gray-500">
                            No inventory accounts found - please create accounts first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Category and Stock (if product) */}
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <CategorySelect
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select or create category"
                />
                <FormMessage />
              </FormItem>
            )}
          />
          
          {!isService && (
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stockQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-stock-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="minStockLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Stock Level</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-min-stock"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            data-testid="button-submit"
          >
            {isLoading ? "Creating..." : `Create ${isService ? "Service" : "Product"}`}
          </Button>
        </div>
      </form>
    </Form>
  );
}