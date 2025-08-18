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

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.vehicles.getAll}?${searchParams}`,
  );
  return data;
};

const createVehicleInventory = async (id, data) => {
  return await http().post(`${endpoints.inventories.getAll}/${id}`, data);
};

const createVehicleVariant = async (data) => {
  return await http().post(endpoints.vehicles.variant, data, true);
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

const vehicle = {
  create: create,
  update: update,
  updatePrice: updatePrice,
  deleteById: deleteById,
  getById: getById,
  get: get,
  createVehicleInventory: createVehicleInventory,
  createVehicleVariant: createVehicleVariant,
  getVehicleInventory: getVehicleInventory,
  getVehicleColors: getVehicleColors,
};

export default vehicle;
