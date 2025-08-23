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
import useGetDealers from "@/hooks/use-get-dealers";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function DealerSelect({
  onChange,
  className = "",
  value,
  dealerId = null,
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } = useGetDealers();
  if (isError) return <ErrorMessage error={error} />;
  return isLoading ? (
    <Skeleton className={"h-9 w-full"} />
  ) : (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className={className}>
        <Button
          variant="outline"
          role="combobox"
          className={cn(
            "w-full justify-between",
            !value && "text-muted-foreground",
          )}
        >
          {value
            ? data.find((dealer) => dealer.value === value)?.label
            : "Select dealer"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search dealer..." className="h-9" />
          <CommandList>
            <CommandEmpty>No dealer found.</CommandEmpty>
            <CommandGroup>
              {data.map((dealer) => (
                <CommandItem
                  value={dealer.label}
                  key={dealer.value}
                  onSelect={() => {
                    onChange(dealer.value);
                    setOpen(false);
                  }}
                >
                  {dealer.label}
                  <Check
                    className={cn("ml-auto opacity-0", {
                      "opacity-100": dealer.value === value,
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
