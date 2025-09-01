import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

// ✅ Bulk create vehicle models
async function bulkCreate(data) {
  const resp = await http().post(`${endpoints.vehicleModels.getAll}`, data);
  return resp.data;
}

// ✅ Update single vehicle model
async function update(id, data) {
  const resp = await http().put(
    `${endpoints.vehicleModels.getAll}/${id}`,
    data,
  );
  return resp.data;
}

// ✅ Delete vehicle model
async function deleteById(id) {
  const resp = await http().delete(`${endpoints.vehicleModels.getAll}/${id}`);
  return resp.data;
}

// ✅ Get all models (with pagination/filters)
async function get(params) {
  const { data } = await http().get(
    `${endpoints.vehicleModels.getAll}?${params}`,
  );
  return data;
}

// ✅ Get model by ID
async function getById(id) {
  const { data } = await http().get(`${endpoints.vehicleModels.getAll}/${id}`);
  return data;
}

const vehicleModel = {
  bulkCreate: bulkCreate,
  update: update,
  deleteById: deleteById,
  get: get,
  getById: getById,
};

export default vehicleModel;
