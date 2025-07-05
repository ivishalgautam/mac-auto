const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const create = async (data) => {
  return await http().post(endpoints.vehicles.getAll, data);
};

const update = async (id, data) => {
  return await http().put(`${endpoints.vehicles.getAll}/${id}`, data);
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

const vehicle = {
  create: create,
  update: update,
  deleteById: deleteById,
  getById: getById,
  get: get,
};

export default vehicle;
