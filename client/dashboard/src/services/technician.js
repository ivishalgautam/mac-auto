import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

async function create(data) {
  const resp = await http().post(`${endpoints.technicians.getAll}`, data);
  return resp.data;
}

async function update(id, data) {
  const resp = await http().put(`${endpoints.technicians.getAll}/${id}`, data);
  return resp.data;
}

async function deleteById(id) {
  return await http().delete(`${endpoints.technicians.getAll}/${id}`);
}

async function get(params) {
  const { data } = await http().get(
    `${endpoints.technicians.getAll}?${params}`,
  );

  return data;
}

async function getById(id) {
  const { data } = await http().get(`${endpoints.technicians.getAll}/${id}`);

  return data;
}

const technicians = {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
};

export default technicians;
