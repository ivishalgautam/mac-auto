const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const createInventory = async (data) => {
  return await http().post(`${endpoints.dealers.inventory}`, data);
};

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.dealers.getAll}?${searchParams}`,
  );
  return data;
};

const getDealerInventoryByVehicleId = async (vehicleId, searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.dealers.inventory}/by-vehicle/${vehicleId}?${searchParams}`,
  );
  return data;
};

const dealer = {
  createInventory: createInventory,
  get: get,
  getDealerInventoryByVehicleId: getDealerInventoryByVehicleId,
};

export default dealer;
