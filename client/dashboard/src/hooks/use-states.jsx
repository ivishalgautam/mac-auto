import { useMemo } from "react";
import { State } from "country-state-city";

export const useStates = () => {
  const states = useMemo(() => {
    return (
      State.getStatesOfCountry("IN").map(({ name, isoCode }) => ({
        value: isoCode,
        label: name,
      })) || []
    );
  }, []);

  return states;
};
