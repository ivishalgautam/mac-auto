const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const create = async (data) => {
  return await http().post(`${endpoints.orders.dealers}`, data);
};

const update = async (id, data) => {
  return await http().put(`${endpoints.orders.dealers}/${id}`, data);
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.orders.dealers}/${id}`);
};

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.orders.dealers}?${searchParams}`,
  );
  return data;
};

const getOrderChassisDetails = async (id) => {
  const { data } = await http().get(
    `${endpoints.orders.dealers}/chassis-details/${id}`,
  );
  return data;
};

const dealerOrder = {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getOrderChassisDetails: getOrderChassisDetails,
};

export default dealerOrder;
