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
  });
};

export const useGetFormattedAvailableVehicles = () => {
  return useQuery({
    queryKey: ["dealer-inventory-formatted"],
    queryFn: () => inventory.getFormattedAvailableVehicles(),
  });
};

export const useGetDealerVehicleColors = (vehicleId) => {
  return useQuery({
    queryFn: () =>
      dealerInventory.getDealerInventoryColorsByVehicleId(vehicleId),
    queryKey: ["vehicles-colors", vehicleId],
    enabled: !!vehicleId,
    select: ({ colors }) => {
      return colors?.map((color) => ({
        value: color.id,
        label: color.color_name,
        hex: color.color_hex,
      }));
    },
  });
};
export const useGetDealerVehicleVariants = (vehicleId) => {
  return useQuery({
    queryFn: () =>
      dealerInventory.getDealerInventoryVariantsByVehicleId(vehicleId),
    queryKey: ["vehicles-variants", vehicleId],
    enabled: !!vehicleId,
    select: ({ variants }) => {
      return variants?.map((v) => ({
        value: v.id,
        label: v.variant_name,
      }));
    },
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
