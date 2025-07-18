import inventory from "@/services/inventory";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetInventoryByVehicleId = (
  vehicleId,
  searchParams = "page=1",
) => {
  return useQuery({
    queryKey: ["vehicle-inventory", vehicleId, searchParams],
    queryFn: () => inventory.getInventoryByVehicleId(vehicleId, searchParams),
    enabled: !!vehicleId,
  });
};

export const useGetInventoryItem = (id) => {
  return useQuery({
    queryKey: ["vehicle-inventory", id],
    queryFn: () => inventory.getInventoryItemById(id),
    enabled: !!id,
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

  return useMutation({
    mutationFn: (data) => inventory.updateInventoryItem(data, id),
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
