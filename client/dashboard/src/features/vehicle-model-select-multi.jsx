"use client";

import ErrorMessage from "@/components/ui/error";
import MultipleSelector from "@/components/ui/multiselect";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetFormattedVehicleModels } from "@/mutations/vehicle-model-mutation";

export default function VehicleModelSelectMulti({
  value,
  onChange,
  className,
}) {
  const { data, isLoading, isError, error } = useGetFormattedVehicleModels("");

  if (isError) return <ErrorMessage error={error} />;

  return isLoading ? (
    <Skeleton className={"h-3"} />
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
