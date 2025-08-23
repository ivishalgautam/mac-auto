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
import { useGetFormattedVehicles } from "@/mutations/vehicle-mutation";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function VehicleSelect({
  onChange,
  className = "",
  value,
  disabled,
  searchParams,
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } =
    useGetFormattedVehicles(searchParams);

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
            ? data.find((vehicle) => vehicle.value === value)?.label
            : "Select vehicle"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search vehicle..." className="h-9" />
          <CommandList>
            <CommandEmpty>No vehicle found.</CommandEmpty>
            <CommandGroup>
              {data.map((vehicle) => (
                <CommandItem
                  value={vehicle.label}
                  key={vehicle.value}
                  onSelect={() => {
                    onChange(vehicle.value);
                    setOpen(false);
                  }}
                >
                  {vehicle.label}
                  <Check
                    className={cn("ml-auto opacity-0", {
                      "opacity-100": vehicle.value === value,
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
