import MultipleSelector from "@/components/ui/multiselect";
import { getCities } from "@/lib/cities";
import React from "react";
import { useMemo } from "react";

export default function CitySelectMuti({
  value,
  stateValue,
  onChange,
  className,
}) {
  const cityOptions = getCities(stateValue);
  const formattedCities = useMemo(() => {
    return cityOptions.map((city) => ({ label: city.name, value: city.name }));
  }, [stateValue]);
  return (
    <MultipleSelector
      options={formattedCities}
      commandProps={{
        label: "Select Cities",
      }}
      value={value}
      defaultOptions={[]}
      placeholder="Select cities"
      hideClearAllButton
      hidePlaceholderWhenSelected
      emptyIndicator={<p className="text-center text-sm">No results found</p>}
      onChange={onChange}
      className={className}
    />
  );
}
