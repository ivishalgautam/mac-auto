import { State } from "country-state-city";

export const getStates = () => {
  const states = State.getStatesOfCountry("IN");
  return states || [];
};
