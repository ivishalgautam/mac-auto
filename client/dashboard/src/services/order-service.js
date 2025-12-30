import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";

export const fetchOrders = async (searchParams) => {
  const { data } = await http().get(
    `${endpoints.orders.getAll}?${searchParams}`,
  );
  return data;
};

export const fetchOrder = async (id) => {
  const { data } = await http().get(`${endpoints.orders.getAll}/${id}`);
  return data;
};

export const createOrder = async (data) => {
  const response = await http().post(endpoints.orders.getAll, data);
  return response.data;
};

export const updateOrder = async (id, data) => {
  return await http().put(`${endpoints.orders.getAll}/${id}`, data, true);
};

export const updateOrderDetails = async (id, data) => {
  return await http().put(
    `${endpoints.orders.getAll}/update-details/${id}`,
    data,
  );
};

export const updateOrderItem = async (orderId, itemId, data) => {
  return await http().put(
    `${endpoints.orders.getAll}/${orderId}/items/${itemId}`,
    data,
  );
};

export const deleteOrder = async (id) => {
  return await http().delete(`${endpoints.orders.getAll}/${id}`);
};

export const fetchOrderItems = async (orderId, searchParams) => {
  const { data } = await http().get(
    `${endpoints.orders.getAll}/${orderId}/items?${searchParams}`,
  );
  return data;
};
export const fetchOrderItem = async (itemId) => {
  const { data } = await http().get(
    `${endpoints.orders.getAll}/items/${itemId}`,
  );
  return data;
};

export const fetchOrderInvoice = async (orderId) => {
  const { data } = await http().get(
    `${endpoints.orders.getAll}/${orderId}/invoice`,
  );
  return data;
};

export const fetchOrderShippingLabel = async (orderId) => {
  const { data } = await http().get(
    `${endpoints.orders.getAll}/${orderId}/shipping-label`,
  );
  return data;
};

export const deleteOrderItem = async (itemId) => {
  const { data } = await http().delete(
    `${endpoints.orders.getAll}/${orderId}/items/${itemId}`,
  );
  return data;
};
