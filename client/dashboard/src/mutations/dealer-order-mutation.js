import dealerOrder from "@/services/dealer-order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetDealerOrders = (searchParams = "") => {
  return useQuery({
    queryKey: ["dealer-orders"],
    queryFn: () => dealerOrder.get(searchParams),
  });
};

export const useGetDealerOrdersChassisDetails = (orderId) => {
  return useQuery({
    queryKey: ["dealer-orders", orderId],
    queryFn: () => dealerOrder.getOrderChassisDetails(orderId),
    enabled: !!orderId,
  });
};

export const useCreateDealerOrder = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dealerOrder.create,
    onSuccess: () => {
      toast("Order updated.");
      queryClient.invalidateQueries(["dealer-orders"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateDealerOrder = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => dealerOrder.update(id, data),
    onSuccess: () => {
      toast("Order updated.");
      queryClient.invalidateQueries(["dealer-orders"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useDeleteDealerOrder = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => dealerOrder.deleteById(id, data),
    onSuccess: () => {
      toast("Order deleted.");
      queryClient.invalidateQueries(["dealer-orders"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};
