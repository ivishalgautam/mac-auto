import vehicle from "@/services/vehicle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCreateVehicleColor = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicle.createVehicleVariant,
    onSuccess: () => {
      toast("Quantity updated successfully.");
      queryClient.invalidateQueries(["vehicles"]);
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

export const useGetVehicleColor = (id) => {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehicle.getVehicleVariant(id),
    enabled: !!id,
  });
};

export const useUpdateVehicleColor = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => vehicle.updateVehicleVariant(id, data),
    onSuccess: () => {
      toast("Vehicle updated successfully.");
      queryClient.invalidateQueries(["vehicles", "vehicles-variants"]);
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
export const useDeleteVehicleColor = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vehicle.deleteVehicleVariant(id),
    onSuccess: () => {
      toast("Vehicle deleted successfully.");

      queryClient.invalidateQueries(["vehicles", "vehicles-variants"]);
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
