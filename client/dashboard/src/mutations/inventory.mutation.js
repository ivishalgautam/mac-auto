import { useAuth } from "@/providers/auth-provider";
import dealer from "@/services/dealer";
import dealerInventory from "@/services/dealer-inventory";
import inventory from "@/services/inventory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetInventoryByVehicleId = (
  vehicleId,
  searchParams = "page=1",
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vehicle-inventory", vehicleId, searchParams],
    queryFn: () =>
      user?.role === "admin"
        ? inventory.getInventoryByVehicleId(vehicleId, searchParams)
        : dealer.getDealerInventoryByVehicleId(vehicleId, searchParams),
    enabled: !!vehicleId && !!user,
  });
};

export const useGetInventoryItem = (id) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["vehicle-inventory", id],
    queryFn: () =>
      user?.role === "admin"
        ? inventory.getInventoryItemById(id)
        : dealerInventory.getDealerInventoryItemById(id),
    enabled: !!id && !!user,
  });
};

export const useUpdateInventoryItem = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => inventory.updateInventoryItem(data, id),
    onSuccess: () => {
      toast.success("Inventory updated successfully.");
      queryClient.invalidateQueries(["vehicle-inventory"]);
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

export const useUpdateInventory = (id, handleSuccess) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data) =>
      user?.role === "admin"
        ? inventory.updateInventoryItem(data, id)
        : dealerInventory.updateDealerInventoryItem(data, id),
    onSuccess: () => {
      toast("Inventory updated successfully.");
      queryClient.invalidateQueries(["vehicle-inventory"]);
      // queryClient.invalidateQueries(["vehicle-inventory", vehicleId, searchParams]);
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

export const useDeleteInventory = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => inventory.deleteById(id),
    onSuccess: () => {
      toast("Inventory deleted successfully.");

      queryClient.invalidateQueries(["vehicle-inventory"]);
      // queryClient.invalidateQueries(["vehicle-inventory", vehicleId, searchParams]);
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
