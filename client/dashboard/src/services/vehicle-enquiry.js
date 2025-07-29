import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

async function create(data) {
  return await http().post(endpoints.vehicleEnquiries.getAll, data);
}

async function update(id, data) {
  const resp = await http().put(
    `${endpoints.vehicleEnquiries.getAll}/${id}`,
    data,
  );
  return resp.data;
}

async function deleteById(id) {
  return await http().delete(`${endpoints.vehicleEnquiries.getAll}/${id}`);
}

async function get(params) {
  const { data } = await http().get(
    `${endpoints.vehicleEnquiries.getAll}?${params}`,
  );

  return data;
}

async function getById(id) {
  const { data } = await http().get(
    `${endpoints.vehicleEnquiries.getAll}/${id}`,
  );
  return data;
}

const vehicleEnquiry = {
  create: create,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
};

export default vehicleEnquiry;
