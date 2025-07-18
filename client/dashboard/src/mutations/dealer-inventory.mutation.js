import dealer from "@/services/dealer";
import inventory from "@/services/inventory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateDealerInventory = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dealer.createInventory,
    onSuccess: () => {
      toast("Inventory updated.");
      queryClient.invalidateQueries(["dealer-inventories"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useGetDealerInventory = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["dealer-inventory", searchParams],
    queryFn: () => inventory.getDealerInventory(searchParams),
    enabled: !!searchParams,
  });
};
