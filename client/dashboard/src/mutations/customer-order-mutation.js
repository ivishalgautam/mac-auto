import customerOrder from "@/services/customer-order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetCustomerOrders = (searchParams = "") => {
  return useQuery({
    queryKey: ["customer-orders"],
    queryFn: () => customerOrder.get(searchParams),
  });
};

export const useCreateCustomerOrder = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerOrder.create,
    onSuccess: () => {
      toast.success("Order created.");
      queryClient.invalidateQueries(["customer-orders"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateCustomerOrder = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => customerOrder.update(id, data),
    onSuccess: () => {
      toast("Order updated.");
      queryClient.invalidateQueries(["customer-orders"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useDeleteCustomerOrder = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => customerOrder.deleteById(id, data),
    onSuccess: () => {
      toast("Order deleted.");
      queryClient.invalidateQueries(["customer-orders"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};
