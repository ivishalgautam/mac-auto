"use client";

import ErrorMessage from "@/components/ui/error";
import MultipleSelector from "@/components/ui/multiselect";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetFormattedVehicleVariants } from "@/mutations/vehicle-variant-mutation";

export default function VehicleVariantSelectMulti({
  value,
  onChange,
  className,
}) {
  const { data, isLoading, isError, error } =
    useGetFormattedVehicleVariants("");

  if (isError) return <ErrorMessage error={error} />;

  return isLoading ? (
    <Skeleton className={"h-9"} />
  ) : (
    <MultipleSelector
      options={data ?? []}
      commandProps={{
        label: "Select Models",
      }}
      value={value}
      defaultOptions={[]}
      placeholder="Select models"
      hideClearAllButton
      hidePlaceholderWhenSelected
      emptyIndicator={
        <p className="text-center text-sm">No models available</p>
      }
      onChange={onChange}
      className={className}
    />
  );
}
