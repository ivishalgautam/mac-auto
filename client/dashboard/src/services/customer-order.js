const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const create = async (data) => {
  return await http().post(`${endpoints.orders.customers}`, data, true);
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.orders.customers}/${id}`);
};
const update = async (id, data) => {
  return await http().put(`${endpoints.orders.customers}/${id}`, data, true);
};

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.orders.customers}?${searchParams}`,
  );
  return data;
};

const customerOrder = {
  create: create,
  deleteById: deleteById,
  update: update,
  get: get,
};

export default customerOrder;
