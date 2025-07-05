import vehicle from "@/services/vehicle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetVehicles = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["vehicles", searchParams],
    queryFn: () => vehicle.get(searchParams),
    enabled: !!searchParams,
  });
};

export const useGetVehicle = (id) => {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehicle.getById(id),
    enabled: !!id,
  });
};

export const useCreateVehicle = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicle.create,
    onSuccess: () => {
      toast("Vehicle created successfully.");
      queryClient.invalidateQueries(["vehicles"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateVehicle = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => vehicle.update(id, data),
    onSuccess: () => {
      toast("Vehicle updated successfully.");
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

export const useDeleteVehicle = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vehicle.deleteById(id),
    onSuccess: () => {
      toast("Vehicle deleted successfully.");

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
