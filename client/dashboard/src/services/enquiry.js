import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export async function updateEnquiry(id, data) {
  const resp = await http().put(`${endpoints.enquiries.getAll}/${id}`, data);
  return resp.data;
}

export async function deleteEnquiry(id) {
  return await http().delete(`${endpoints.enquiries.getAll}/${id}`);
}

export async function fetchEnquiries(params) {
  const { data } = await http().get(`${endpoints.enquiries.getAll}?${params}`);

  return data;
}

export async function fetchEnquiry(id) {
  const { data } = await http().get(`${endpoints.enquiries.getAll}/${id}`);
  return data;
}
