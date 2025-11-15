import MultipleSelector from "@/components/ui/multiselect";
import React from "react";
import { Skeleton } from "./ui/skeleton";
import ErrorMessage from "./ui/error";

export default function CustomMultiSelect({
  value,
  onChange,
  options,
  className,
  placeholder = "Select options",
  async = false,
  isLoading = false,
  isError = false,
  error = "error",
  disabled = false,
}) {
  if (async && isLoading) return <Skeleton className={"h-10"} />;
  if (isError) return <ErrorMessage error={error} />;
  return (
    <MultipleSelector
      options={options}
      commandProps={{
        label: placeholder,
      }}
      value={value}
      defaultOptions={[]}
      placeholder={placeholder}
      hideClearAllButton
      hidePlaceholderWhenSelected
      emptyIndicator={<p className="text-center text-sm">No results found</p>}
      onChange={onChange}
      className={className}
      disabled={disabled}
    />
  );
}
