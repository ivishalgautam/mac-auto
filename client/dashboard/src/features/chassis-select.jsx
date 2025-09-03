import ErrorMessage from "@/components/ui/error";
import { useGetInventories } from "@/mutations/inventory.mutation";
import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MultipleSelector from "@/components/ui/multiselect";

export default function ChassisSelect({
  vehicleId,
  vehicleColorId,
  vehicleVariantMapId,
  value,
  onChange,
  className,
  ...props
}) {
  const { data, isLoading, isError, error } = useGetInventories(
    `vcid=${vehicleColorId ?? null}&vvmid=${vehicleVariantMapId ?? null}&status=active`,
  );

  const formattedNumbers = useMemo(() => {
    return (
      data?.inventory?.map(({ chassis_no }) => ({
        value: chassis_no,
        label: chassis_no,
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
      {...props}
    />
  );
}
