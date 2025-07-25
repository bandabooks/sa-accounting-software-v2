import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Account {
  id: number;
  companyId: number;
  accountCode: string;
  accountName: string;
  accountType: string;
}

interface AccountSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  accountType?: "revenue" | "expense" | "asset" | "liability" | "equity" | "all";
}

export function AccountSelect({
  value,
  onValueChange,
  placeholder = "Select account...",
  disabled = false,
  accountType = "all",
}: AccountSelectProps) {
  const [open, setOpen] = useState(false);

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ["/api/chart-of-accounts"],
  });

  // Get current company to filter accounts
  const { data: activeCompany } = useQuery({
    queryKey: ["/api/companies/active"],
  });

  console.log("AccountSelect - Raw accounts data:", accounts);
  console.log("AccountSelect - Account type filter:", accountType);

  // Filter accounts based on current company and type, then deduplicate
  const filteredAccounts = accounts
    .filter((account: Account) => {
      // Only show accounts from the current company
      if (activeCompany && account.companyId !== activeCompany.id) {
        return false;
      }
      
      if (accountType === "all") return true;
      
      const type = account.accountType?.toLowerCase();
      console.log(`Checking account ${account.accountCode} - ${account.accountName} with type: "${type}"`);
      
      switch (accountType) {
        case "revenue":
          return type === "revenue";
        case "expense":
          return type === "expense" || type === "cost of goods sold";
        case "asset":
          return type === "asset";
        case "liability":
          return type === "liability";
        case "equity":
          return type === "equity";
        default:
          return true;
      }
    })
    .reduce((unique: Account[], account: Account) => {
      // Deduplicate by account code and name combination
      const exists = unique.find(acc => 
        acc.accountCode === account.accountCode && 
        acc.accountName === account.accountName
      );
      if (!exists) {
        unique.push(account);
      }
      return unique;
    }, [])
    .sort((a, b) => a.accountCode.localeCompare(b.accountCode)); // Sort by account code

  console.log("AccountSelect - Filtered and deduplicated accounts:", filteredAccounts);

  const selectedAccount = filteredAccounts.find((account: Account) => account.id.toString() === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedAccount ? (
            <span className="truncate">
              {selectedAccount.accountCode} - {selectedAccount.accountName}
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search accounts..." />
          <CommandList>
            <CommandEmpty>No accounts found.</CommandEmpty>
            <CommandGroup>
              {filteredAccounts.map((account: Account) => (
                <CommandItem
                  key={account.id}
                  onSelect={() => {
                    onValueChange(account.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === account.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {account.accountCode} - {account.accountName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.accountType}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}