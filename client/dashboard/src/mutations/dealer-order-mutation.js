import dealerOrder from "@/services/dealer-order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetDealerOrders = (searchParams = "") => {
  return useQuery({
    queryKey: ["dealer-orders"],
    queryFn: () => dealerOrder.get(searchParams),
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
