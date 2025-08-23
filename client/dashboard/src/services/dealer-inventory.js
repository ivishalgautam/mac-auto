import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

const getDealerInventory = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.dealers.inventory}?${searchParams}`,
  );
  return data;
};

const getDealerInventoryByVehicleId = async (vehicleId, searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.dealers.inventory}/by-vehicle/${vehicleId}?${searchParams}`,
  );
  return data;
};
const getDealerInventoryColorsByVehicleId = async (
  vehicleId,
  searchParams = "",
) => {
  const { data } = await http().get(
    `${endpoints.dealers.inventory}/by-vehicle/${vehicleId}/colors?${searchParams}`,
  );
  return data;
};

const updateDealerInventoryItem = async (data, id) => {
  return await http().put(`${endpoints.dealers.inventory}/${id}`, data);
};

const deleteDealerInventoryById = async (id) => {
  return await http().put(`${endpoints.dealers.inventory}/${id}`);
};

const getDealerInventoryItemById = async (id) => {
  const { data } = await http().get(`${endpoints.dealers.inventory}/${id}`);
  return data;
};

const dealerInventory = {
  getDealerInventory: getDealerInventory,
  getDealerInventoryByVehicleId: getDealerInventoryByVehicleId,
  getDealerInventoryColorsByVehicleId: getDealerInventoryColorsByVehicleId,
  updateDealerInventoryItem: updateDealerInventoryItem,
  deleteDealerInventoryById: deleteDealerInventoryById,
  getDealerInventoryItemById: getDealerInventoryItemById,
};

export default dealerInventory;
