import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const createPart = async (data) => {
  const resp = await http().post(endpoints.parts.getAll, data);
  return resp.data;
};

export const updatePart = async (id, data) => {
  const resp = await http().put(`${endpoints.parts.getAll}/${id}`, data);
  return resp.data;
};

export const deletePart = async (id) => {
  return await http().delete(`${endpoints.parts.getAll}/${id}`);
};

export const getParts = async (params) => {
  const { data } = await http().get(`${endpoints.parts.getAll}?${params}`);

  return data;
};

export const getPart = async (id) => {
  const { data } = await http().get(`${endpoints.parts.getAll}/${id}`);
  return data;
};
