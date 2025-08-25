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
import { vehicleCategories } from "@/data";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function VehicleCategorySelect({
  onChange,
  className = "",
  value,
}) {
  const [open, setOpen] = useState(false);

  return (
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
            ? vehicleCategories.find((category) => category.value === value)
                ?.label
            : "Select category"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search category..." className="h-9" />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {vehicleCategories.map((category) => (
                <CommandItem
                  value={category.label}
                  key={category.value}
                  onSelect={() => {
                    onChange(category.value);
                    setOpen(false);
                  }}
                >
                  {category.label}
                  <Check
                    className={cn("ml-auto opacity-0", {
                      "opacity-100": category.value === value,
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
