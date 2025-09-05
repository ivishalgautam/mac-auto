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
import { Muted } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useGetFormattedUsers } from "@/mutations/user-mutation";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

export default function UserSelect({
  onChange,
  className = "",
  value,
  disabled,
  role = "",
}) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, isError, error } = useGetFormattedUsers(
    `role=${role}`,
  );
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
            ? data.find((user) => user.value === value)?.label
            : `Select ${role ?? "user"}`}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Search ..." className="h-9" />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {data.map((user) => (
                <CommandItem
                  value={user.label + user.phone}
                  key={user.value}
                  onSelect={() => {
                    onChange(user.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex w-full items-center justify-between">
                    <span>{user.label}</span>
                    <Muted className={"ml-1 text-xs"}>({user.phone})</Muted>
                    <Check
                      className={cn("ml-auto opacity-0", {
                        "opacity-100": user.value === value,
                      })}
                    />
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
