import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

async function create(data) {
  const resp = await http().post(`${endpoints.invoices.getAll}`, data);
  return resp.data;
}

async function update(id, data) {
  const resp = await http().put(`${endpoints.invoices.getAll}/${id}`, data);
  return resp.data;
}

async function deleteById(id) {
  return await http().delete(`${endpoints.invoices.getAll}/${id}`);
}

async function get(params) {
  const { data } = await http().get(`${endpoints.invoices.getAll}?${params}`);

  return data;
}

async function getById(id) {
  const { data } = await http().get(`${endpoints.invoices.getAll}/${id}`);

  return data;
}

const invoice = {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
};

export default invoice;
