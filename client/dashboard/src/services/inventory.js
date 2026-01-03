import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

const getDealerInventory = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.dealers.inventory}?${searchParams}`,
  );
  return data;
};

const getFormattedAvailableVehicles = async () => {
  const { data } = await http().get(
    `${endpoints.dealers.inventory}/get-formatted-available-vehicles`,
  );
  return data;
};
const getInventories = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.inventories.getAll}?${searchParams}`,
  );
  return data;
};

const getInventoryByVehicleId = async (vehicleId, searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.inventories.getByVehicle}/${vehicleId}?${searchParams}`,
  );
  return data;
};

const getInventoryByVehicleColorId = async (vehicleId, searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.inventories.getByVehicleColor}/${vehicleId}?${searchParams}`,
  );
  return data;
};
const getInventoryByVehicleColorAndVariant = async (
  vehicleId,
  searchParams = "",
) => {
  const { data } = await http().get(
    `${endpoints.inventories.getByVehicleColor}/${vehicleId}?${searchParams}`,
  );
  return data;
};

const updateInventoryItem = async (data, id) => {
  return await http().put(`${endpoints.inventories.getAll}/${id}`, data);
};

const deleteById = async (id) => {
  return await http().put(`${endpoints.inventories.getAll}/${id}`);
};

const getInventoryItemById = async (id) => {
  const { data } = await http().get(`${endpoints.inventories.getAll}/${id}`);
  return data;
};

const inventory = {
  getDealerInventory: getDealerInventory,
  getInventories: getInventories,
  getInventoryByVehicleId: getInventoryByVehicleId,
  getInventoryByVehicleColorId: getInventoryByVehicleColorId,
  updateInventoryItem: updateInventoryItem,
  deleteById: deleteById,
  getInventoryItemById: getInventoryItemById,
  getFormattedAvailableVehicles: getFormattedAvailableVehicles,
};

export default inventory;
