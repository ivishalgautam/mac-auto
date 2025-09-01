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
import { useGetDealerVehicleColors } from "@/mutations/dealer-inventory.mutation";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function DealerVehicleColorSelect({
  onChange,
  className = "",
  value,
  vehicleId = null,
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } =
    useGetDealerVehicleColors(vehicleId);

  if (!vehicleId) return <ErrorMessage error={"Vehicle not found!"} />;
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
          {value ? (
            <div className="flex items-center justify-start gap-2">
              <div
                className={"size-4 rounded-full"}
                style={{
                  background: data.find((color) => color.value === value)?.hex,
                }}
              ></div>
              {data.find((color) => color.value === value)?.label}
            </div>
          ) : (
            "Select color"
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search color..." className="h-9" />
          <CommandList>
            <CommandEmpty>No color found.</CommandEmpty>
            <CommandGroup>
              {data.map((color) => (
                <CommandItem
                  value={color.label}
                  key={color.value}
                  onSelect={() => {
                    onChange(color.value);
                    setOpen(false);
                  }}
                >
                  <div
                    className={"size-4 rounded-full"}
                    style={{ background: color.hex }}
                  ></div>{" "}
                  {color.label}
                  <Check
                    className={cn("ml-auto opacity-0", {
                      "opacity-100": color.value === value,
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
