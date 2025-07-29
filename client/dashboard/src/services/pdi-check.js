const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const create = async (orderId, data) => {
  return await http().post(`${endpoints.pdiChecks.getAll}/${orderId}`, data);
};

const update = async (id, data) => {
  return await http().put(`${endpoints.pdiChecks.getAll}/${id}`, data);
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.pdiChecks.getAll}/${id}`);
};

const getById = async (id) => {
  const { data } = await http().get(`${endpoints.pdiChecks.getAll}/${id}`);
  return data;
};

const pdiCheck = {
  create: create,
  update: update,
  deleteById: deleteById,
  getById: getById,
};

export default pdiCheck;
