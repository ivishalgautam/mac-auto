import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

const create = async (data) => {
  const resp = await http().post(endpoints.schemes.getAll, data, true);
  return resp.data;
};

const update = async (id, data) => {
  const resp = await http().put(
    `${endpoints.schemes.getAll}/${id}`,
    data,
    true,
  );
  return resp.data;
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.schemes.getAll}/${id}`);
};

const get = async (params) => {
  const { data } = await http().get(`${endpoints.schemes.getAll}?${params}`);

  return data;
};

const getById = async (id) => {
  const { data } = await http().get(`${endpoints.schemes.getAll}/${id}`);
  return data;
};

const scheme = {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
};

export default scheme;
