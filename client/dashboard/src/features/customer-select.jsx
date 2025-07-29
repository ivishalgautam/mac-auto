import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import ErrorMessage from "@/components/ui/error";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useGetFormattedCustomers } from "@/mutations/customer-mutation";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function CustomerSelect({
  onChange,
  className = "",
  value,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } = useGetFormattedCustomers();
  if (isError) return <ErrorMessage error={error} />;
  return isLoading ? (
    <Skeleton className={"h-9 w-full"} />
  ) : (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={className} disabled={disabled}>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
          )}
        >
          {value
            ? data.find((customer) => customer.value === value)?.label
            : "Select customer"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search customer..." className="h-9" />
          <CommandList>
            <CommandEmpty>No customer found.</CommandEmpty>
            <CommandGroup>
              {data.map((customer) => (
                <CommandItem
                  value={customer.value}
                  key={customer.value}
                  onSelect={() => {
                    onChange(customer.value);
                    setOpen(false);
                  }}
                >
                  {customer.label}
                  <Check
                    className={cn("ml-auto opacity-0", {
                      "opacity-100": customer.value === value,
                    })}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
