import ErrorMessage from "@/components/ui/error";
import { useGetInventoryByVehicleId } from "@/mutations/inventory.mutation";
import { useFormContext } from "react-hook-form";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MultipleSelector from "@/components/ui/multiselect";

export default function ChassisSelect({
  vehicleId,
  value,
  onChange,
  className,
}) {
  const { data, isLoading, isError, error } = useGetInventoryByVehicleId(
    vehicleId,
    "status=active",
  );
  const formattedNumbers = useMemo(() => {
    return (
      data?.inventory?.map(({ id: value, chassis_no: label }) => ({
        value,
        label,
      })) ?? []
    );
  }, [data]);

  if (isError) return <ErrorMessage error={error} />;

  return isLoading ? (
    <Skeleton className={"h-9 w-full"} />
  ) : (
    <MultipleSelector
      options={formattedNumbers}
      commandProps={{
        label: "Select Chassis Numbers",
      }}
      value={value}
      defaultOptions={[]}
      placeholder="Select Chassis Numbers"
      hideClearAllButton
      hidePlaceholderWhenSelected
      emptyIndicator={<p className="text-center text-sm">No results found</p>}
      onChange={onChange}
      className={className}
    />
  );
}
