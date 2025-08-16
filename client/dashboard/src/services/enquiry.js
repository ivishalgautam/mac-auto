import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export async function createEnquiry(data) {
  const resp = await http().post(endpoints.enquiries.getAll, data);
  return resp.data;
}

export async function convertInquiryToCustomer(inquiryId, data) {
  const resp = await http().post(
    `${endpoints.enquiries.getAll}/convert-to-customer/${inquiryId}`,
    data,
  );
  return resp.data;
}

export async function inquiryAssignToDealer(inquiryId, data) {
  const resp = await http().post(
    `${endpoints.enquiries.getAll}/assign-to-dealer/${inquiryId}`,
    data,
  );
  return resp.data;
}

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

// walkin enquiry
export async function createWalkInEnquiry(data) {
  const resp = await http().post(endpoints.walkInEnquiries.getAll, data, true);
  return resp.data;
}
export async function updateWalkinEnquiry(id, data) {
  const resp = await http().put(
    `${endpoints.walkInEnquiries.getAll}/${id}`,
    data,
    true,
  );
  return resp.data;
}
export async function deleteWalkinEnquiry(id) {
  return await http().delete(`${endpoints.walkInEnquiries.getAll}/${id}`);
}
export async function fetchWalkinEnquiries(params) {
  const { data } = await http().get(
    `${endpoints.walkInEnquiries.getAll}?${params}`,
  );

  return data;
}
export async function fetchWalkinEnquiry(id) {
  return await http().get(`${endpoints.walkInEnquiries.getAll}/${id}`);
}
