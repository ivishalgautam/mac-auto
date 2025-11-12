import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  deleteOrder,
  deleteOrderItem,
  fetchOrder,
  fetchOrderInvoice,
  fetchOrderItem,
  fetchOrderItems,
  fetchOrders,
  fetchOrderShippingLabel,
  updateOrder,
  updateOrderItem,
} from "@/services/order-service";
import { toast } from "sonner";

export const useOrders = (searchParams = "") => {
  return useQuery({
    queryKey: ["orders", searchParams],
    queryFn: () => fetchOrders(searchParams),
  });
};

export const useFormattedOrders = (searchParams = "") => {
  return useQuery({
    queryKey: ["orders", searchParams],
    queryFn: () => fetchOrders(searchParams),
    select: ({ orders }) => {
      return orders?.map((b) => ({
        value: b.id,
        label: b.order_number,
      }));
    },
  });
};

export const useOrder = (id) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => fetchOrder(id),
    enabled: !!id,
  });
};

export const useCreateOrder = (callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      toast.success("Order placed");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      callback?.();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Something went wrong.",
      );
    },
  });
};

export const useUpdateOrder = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["orders", id],
    mutationFn: (data) => updateOrder(id, data),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      callback?.();
    },
  });
};

export const useUpdateOrderItem = (orderId, itemId, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["orders-items", orderId, itemId],
    mutationFn: (data) => updateOrderItem(orderId, itemId, data),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["orders-items"] });
      callback?.();
    },
  });
};

export const useDeleteOrder = (id, callback) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["orders", id],
    mutationFn: () => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      callback?.();
    },
  });
};

export const useOrderItems = (orderId, searchParams = "") => {
  return useQuery({
    queryKey: ["orders-items", orderId, searchParams],
    queryFn: () => fetchOrderItems(orderId, searchParams),
    enabled: !!orderId,
  });
};

export const useOrderItem = (itemId) => {
  return useQuery({
    queryKey: ["orders-items", itemId],
    queryFn: () => fetchOrderItem(itemId),
    enabled: !!itemId,
  });
};

export const useOrderInvoice = (orderId) => {
  return useQuery({
    queryKey: ["orders-invoice", orderId],
    queryFn: () => fetchOrderInvoice(orderId),
    enabled: !!orderId,
  });
};

export const useOrderShippingLabel = (orderId) => {
  return useQuery({
    queryKey: ["orders-shipping-label", orderId],
    queryFn: () => fetchOrderShippingLabel(orderId),
    enabled: !!orderId,
  });
};

export const useDeleteOrderItem = (itemId) => {
  return useQuery({
    queryKey: ["orders-items", itemId],
    queryFn: () => deleteOrderItem(itemId),
    enabled: !!itemId,
  });
};
