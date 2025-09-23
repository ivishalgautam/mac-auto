import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

async function create(data) {
  const resp = await http().post(`${endpoints.quotations.getAll}`, data);
  return resp.data;
}

async function update(id, data) {
  const resp = await http().put(`${endpoints.quotations.getAll}/${id}`, data);
  return resp.data;
}

async function convertToInvoice(id, data) {
  const resp = await http().post(
    `${endpoints.quotations.getAll}/${id}/convert-to-invoice`,
    data,
  );
  return resp.data;
}

async function deleteById(id) {
  return await http().delete(`${endpoints.quotations.getAll}/${id}`);
}

async function get(params) {
  const { data } = await http().get(`${endpoints.quotations.getAll}?${params}`);

  return data;
}

async function getById(id) {
  const { data } = await http().get(`${endpoints.quotations.getAll}/${id}`);

  return data;
}

const quotation = {
  create: create,
  update: update,
  convertToInvoice: convertToInvoice,
  deleteById: deleteById,
  get: get,
  getById: getById,
};

export default quotation;
