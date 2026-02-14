import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const createCustomerInventory = async (data) => {
  const resp = await http().post(endpoints.customerInventories.getAll, data);
  return resp.data;
};

export const updateCustomerInventory = async (id, data) => {
  const resp = await http().put(
    `${endpoints.customerInventories.getAll}/${id}`,
    data,
  );
  return resp.data;
};

export const deleteCustomerInventory = async (id) => {
  return await http().delete(`${endpoints.customerInventories.getAll}/${id}`);
};

export const getCustomerInventories = async (params) => {
  const { data } = await http().get(
    `${endpoints.customerInventories.getAll}?${params}`,
  );

  return data;
};

export const getCustomerInventory = async (id) => {
  const { data } = await http().get(
    `${endpoints.customerInventories.getAll}/${id}`,
  );
  return data;
};
