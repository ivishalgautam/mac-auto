import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const createTicketUpdate = async (data) => {
  const resp = await http().post(endpoints.ticketUpdates.getAll, data);
  return resp.data;
};

export const updateTicketUpdate = async (id, data) => {
  const resp = await http().put(
    `${endpoints.ticketUpdates.getAll}/${id}`,
    data,
  );
  return resp.data;
};

export const deleteTicketUpdate = async (id) => {
  return await http().delete(`${endpoints.ticketUpdates.getAll}/${id}`);
};

export const getTicketUpdates = async (params) => {
  const { data } = await http().get(
    `${endpoints.ticketUpdates.getAll}?${params}`,
  );

  return data;
};

export const getTicketUpdatesByTicket = async (id) => {
  const { data } = await http().get(
    `${endpoints.ticketUpdates.getAll}/get-by-ticket/${id}`,
  );

  return data;
};

export const getTicketUpdate = async (id) => {
  const { data } = await http().get(`${endpoints.ticketUpdates.getAll}/${id}`);
  return data;
};
