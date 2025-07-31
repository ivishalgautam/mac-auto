import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

const create = async (data) => {
  const resp = await http().post(endpoints.followUps.getAll, data);
  return resp.data;
};

const update = async (id, data) => {
  const resp = await http().put(`${endpoints.followUps.getAll}/${id}`, data);
  return resp.data;
};

const deleteById = async (id) => {
  return await http().delete(`${endpoints.followUps.getAll}/${id}`);
};

const get = async (params) => {
  const { data } = await http().get(`${endpoints.followUps.getAll}?${params}`);

  return data;
};

const getById = async (id) => {
  const { data } = await http().get(`${endpoints.followUps.getAll}/${id}`);
  return data;
};

const followup = {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
};

export default followup;
