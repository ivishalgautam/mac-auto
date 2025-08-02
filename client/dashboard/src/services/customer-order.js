const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const create = async (data) => {
  return await http().post(`${endpoints.orders.customers}`, data);
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.orders.customers}/${id}`);
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
  get: get,
};

export default customerOrder;
