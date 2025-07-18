import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

async function create(data) {
  const resp = await http().post(`${endpoints.financers.getAll}`, data, true);
  return resp.data;
}

async function update(id, data) {
  const resp = await http().put(
    `${endpoints.financers.getAll}/${id}`,
    data,
    true,
  );
  return resp.data;
}

async function deleteById(id) {
  return await http().delete(`${endpoints.financers.getAll}/${id}`);
}

async function getFinancers(params) {
  const { data } = await http().get(`${endpoints.financers.getAll}?${params}`);

  return data;
}

async function getFinancer(id) {
  const { data } = await http().get(`${endpoints.financers.getAll}/${id}`);

  return data;
}

const financer = {
  create: create,
  update: update,
  deleteById: deleteById,
  getFinancers: getFinancers,
  getFinancer: getFinancer,
};

export default financer;
