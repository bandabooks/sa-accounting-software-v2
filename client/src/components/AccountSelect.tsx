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
  code: string;
  name: string;
  type: string;
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

  console.log("AccountSelect - Raw accounts data:", accounts);
  console.log("AccountSelect - Account type filter:", accountType);

  // Filter accounts based on type
  const filteredAccounts = accounts.filter((account: Account) => {
    if (accountType === "all") return true;
    
    const type = account.type?.toLowerCase();
    console.log(`Checking account ${account.code} - ${account.name} with type: "${type}"`);
    
    switch (accountType) {
      case "revenue":
        return type === "revenue" || type === "income";
      case "expense":
        return type === "expense" || type === "cost of sales" || type === "cost of goods sold" || type === "cogs";
      case "asset":
        return type === "asset" || type === "current asset" || type === "non-current asset";
      case "liability":
        return type === "liability" || type === "current liability" || type === "non-current liability";
      case "equity":
        return type === "equity";
      default:
        return true;
    }
  });

  console.log("AccountSelect - Filtered accounts:", filteredAccounts);

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
              {selectedAccount.code} - {selectedAccount.name}
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
                      {account.code} - {account.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {account.type}
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