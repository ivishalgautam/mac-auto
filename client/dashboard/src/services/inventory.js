import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

const getDealerInventory = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.dealers.inventory}?${searchParams}`,
  );
  return data;
};

const getInventoryByVehicleId = async (vehicleId, searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.inventories.getByVehicle}/${vehicleId}?${searchParams}`,
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
  getInventoryByVehicleId: getInventoryByVehicleId,
  updateInventoryItem: updateInventoryItem,
  deleteById: deleteById,
  getInventoryItemById: getInventoryItemById,
};

export default inventory;
