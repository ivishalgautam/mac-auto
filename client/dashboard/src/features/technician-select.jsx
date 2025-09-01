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
import { useGetFormattedTechnicians } from "@/mutations/technician-mutation";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function TechnicianSelect({
  onChange,
  className = "",
  value,
  disabled,
  searchParams,
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } =
    useGetFormattedTechnicians(searchParams);

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
            ? data.find((technician) => technician.value === value)?.label
            : "Select technician"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search technician..." className="h-9" />
          <CommandList>
            <CommandEmpty>No technician found.</CommandEmpty>
            <CommandGroup>
              {data?.map((technician) => (
                <CommandItem
                  value={technician.label}
                  key={technician.value}
                  onSelect={() => {
                    onChange(technician.value);
                    setOpen(false);
                  }}
                >
                  {technician.label}
                  <Check
                    className={cn("ml-auto opacity-0", {
                      "opacity-100": technician.value === value,
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
