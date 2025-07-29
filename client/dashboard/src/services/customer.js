const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const assignToDealer = async (data) => {
  return await http().post(
    `${endpoints.customers.getAll}/assign-to-dealer`,
    data,
  );
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.customers.getAll}/${id}`);
};

const getById = async (id) => {
  return await http().get(`${endpoints.customers.getAll}/${id}`);
};

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.customers.getAll}?${searchParams}`,
  );
  return data;
};

const getDealerCustomers = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.customers.getAll}/dealer-customers?${searchParams}`,
  );
  return data;
};

const customer = {
  assignToDealer: assignToDealer,
  deleteById: deleteById,
  getById: getById,
  get: get,
  getDealerCustomers: getDealerCustomers,
};

export default customer;
