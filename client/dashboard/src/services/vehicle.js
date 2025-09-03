const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const create = async (data) => {
  return await http().post(endpoints.vehicles.getAll, data, true);
};

const update = async (id, data) => {
  return await http().put(`${endpoints.vehicles.getAll}/${id}`, data, true);
};

const updatePrice = async (id, data) => {
  return await http().put(
    `${endpoints.vehicles.getAll}/update-price/${id}`,
    data,
  );
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.vehicles.getAll}/${id}`);
};

const getById = async (id) => {
  const { data } = await http().get(`${endpoints.vehicles.getAll}/${id}`);
  return data;
};

const getByMarketingData = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.vehicles.getAll}/marketing-materials?${searchParams}`,
  );
  return data;
};

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.vehicles.getAll}?${searchParams}`,
  );
  return data;
};

const createVehicleInventory = async (id, data) => {
  return await http().post(`${endpoints.inventories.getAll}/${id}`, data);
};

const getVehicleInventory = async (id) => {
  const { data } = await http().get(`${endpoints.inventories.getAll}/${id}`);
  return data;
};

const getVehicleColors = async (vehicleId) => {
  const { data } = await http().get(
    `${endpoints.vehicles.getAll}/${vehicleId}/colors`,
  );
  return data;
};
const getVehicleVariants = async (vehicleId) => {
  const { data } = await http().get(
    `${endpoints.vehicles.getAll}/${vehicleId}/variants`,
  );
  return data;
};

const createVehicleVariant = async (data) => {
  return await http().post(endpoints.vehicles.variant, data, true);
};
const updateVehicleVariant = async (id, data) => {
  return await http().put(`${endpoints.vehicles.variant}/${id}`, data, true);
};
const deleteVehicleVariant = async (id) => {
  return await http().put(`${endpoints.vehicles.variant}/${id}`);
};
const getVehicleVariant = async (id) => {
  const { data } = await http().get(`${endpoints.vehicles.variant}/${id}`);
  return data;
};

const vehicle = {
  create: create,
  update: update,
  updatePrice: updatePrice,
  getByMarketingData: getByMarketingData,
  deleteById: deleteById,
  getById: getById,
  get: get,
  createVehicleInventory: createVehicleInventory,
  getVehicleInventory: getVehicleInventory,
  getVehicleColors: getVehicleColors,
  getVehicleVariants: getVehicleVariants,
  createVehicleVariant: createVehicleVariant,
  getVehicleVariant: getVehicleVariant,
  updateVehicleVariant: updateVehicleVariant,
  deleteVehicleVariant: deleteVehicleVariant,
};

export default vehicle;
