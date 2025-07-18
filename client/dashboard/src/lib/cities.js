const { City } = require("country-state-city");

export const getCities = (stateCode) => {
  const cities = City.getCitiesOfState("IN", stateCode);
  return cities || [];
};
