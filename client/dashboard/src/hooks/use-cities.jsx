import { useMemo } from "react";
import { City } from "country-state-city";

export const useCitiesByState = (stateCode) => {
  const cities = useMemo(() => {
    if (!stateCode) return [];
    return (
      City.getCitiesOfState("IN", stateCode).map(({ name }) => ({
        value: name,
        label: name,
      })) || []
    );
  }, [stateCode]);

  return cities;
};
