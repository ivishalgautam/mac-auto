const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const create = async (data) => {
  return await http().post(`${endpoints.orders.dealers}`, data);
};

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.orders.dealers}?${searchParams}`,
  );
  return data;
};

const dealerOrder = {
  create: create,
  get: get,
};

export default dealerOrder;
