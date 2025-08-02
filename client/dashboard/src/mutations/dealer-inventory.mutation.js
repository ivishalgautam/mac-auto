import dealer from "@/services/dealer";
import dealerInventory from "@/services/dealer-inventory";
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

export const useGetDealerInventoryByVehicleId = (
  vehicleId,
  searchParams = "page=1",
) => {
  return useQuery({
    queryKey: ["dealer-inventory", vehicleId, searchParams],
    queryFn: () =>
      dealer.getDealerInventoryByVehicleId(vehicleId, searchParams),
    enabled: !!vehicleId,
  });
};

export const useUpdateDealerInventoryItem = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => dealerInventory.updateDealerInventoryItem(data, id),
    onSuccess: () => {
      toast.success("Inventory updated successfully.");
      queryClient.invalidateQueries(["dealer-inventory"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useDeleteDealerInventory = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dealerInventory.deleteDealerInventoryById(id),
    onSuccess: () => {
      toast("Inventory deleted successfully.");

      queryClient.invalidateQueries(["dealer-inventory"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};
