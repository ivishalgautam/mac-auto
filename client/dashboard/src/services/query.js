import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

async function update(id, data) {
  const resp = await http().put(`${endpoints.queries.getAll}/${id}`, data);
  return resp.data;
}

async function deleteById(id) {
  return await http().delete(`${endpoints.queries.getAll}/${id}`);
}

async function get(params) {
  const { data } = await http().get(`${endpoints.queries.getAll}?${params}`);

  return data;
}

async function getQuery(id) {
  const { data } = await http().get(`${endpoints.queries.getAll}/${id}`);
  return data;
}

const query = {
  update: update,
  deleteById: deleteById,
  get: get,
  getQuery: getQuery,
};

export default query;
