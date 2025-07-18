const { endpoints } = require("@/utils/endpoints");
const { default: http } = require("@/utils/http");

const createInventory = async (data) => {
  return await http().post(`${endpoints.dealers.inventory}`, data);
};

const get = async (searchParams = "") => {
  const { data } = await http().get(
    `${endpoints.dealers.getAll}?${searchParams}`,
  );
  return data;
};

const dealer = {
  createInventory: createInventory,
  get: get,
};

export default dealer;
