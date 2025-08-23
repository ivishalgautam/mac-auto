import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

async function create(data) {
  const resp = await http().post(`${endpoints.tickets.getAll}`, data, true);
  return resp.data;
}

async function update(id, data) {
  const resp = await http().put(
    `${endpoints.tickets.getAll}/${id}`,
    data,
    true,
  );
  return resp.data;
}

async function deleteById(id) {
  return await http().delete(`${endpoints.tickets.getAll}/${id}`);
}

async function get(params) {
  const { data } = await http().get(`${endpoints.tickets.getAll}?${params}`);

  return data;
}

async function getById(id) {
  const { data } = await http().get(`${endpoints.tickets.getAll}/${id}`);

  return data;
}

async function getByDetailsId(id) {
  const { data } = await http().get(
    `${endpoints.tickets.getAll}/${id}/details`,
  );

  return data;
}

const ticket = {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
  getByDetailsId: getByDetailsId,
};

export default ticket;
