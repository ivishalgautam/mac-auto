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

export function useGetFormattedVehicles(searchParams = "") {
  return useQuery({
    queryKey: ["vehicles", searchParams],
    queryFn: () => vehicle.get(searchParams),
    select: ({ vehicles = [] }) => {
      return vehicles.map((vehicle) => ({
        value: vehicle.id,
        label: vehicle.title,
      }));
    },
  });
}

export const useGetVehicle = (id) => {
  return useQuery({
    queryKey: ["vehicles", id],
    queryFn: () => vehicle.getById(id),
    enabled: !!id,
  });
};

export const useGetVehicleMarketingData = (searchParams = "") => {
  return useQuery({
    queryKey: ["vehicles-materials", searchParams],
    queryFn: () => vehicle.getByMarketingData(searchParams),
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

export const useUpdateVehiclePrice = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => vehicle.updatePrice(id, data),
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

export const useUpdateVehicleStatus = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => vehicle.updateStatus(id, data),
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

// inventory
export const useGetVehicleInventory = (id) => {
  return useQuery({
    queryKey: ["vehicles-inventory", id],
    queryFn: () => vehicle.getVehicleInventory(id),
    enabled: !!id,
  });
};

export const useCreateVehicleInventory = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => vehicle.createVehicleInventory(id, data),
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

export const useGetVehicleColors = (vehicleId) => {
  return useQuery({
    queryFn: () => vehicle.getVehicleColors(vehicleId),
    queryKey: ["vehicles-colors", vehicleId],
    enabled: !!vehicleId,
    select: (data) => {
      return data.map((color) => ({
        value: color.id,
        label: color.color_name,
        hex: color.color_hex,
      }));
    },
  });
};
export const useGetVehicleVariants = (vehicleId) => {
  return useQuery({
    queryFn: () => vehicle.getVehicleVariants(vehicleId),
    queryKey: ["vehicles-variants", vehicleId],
    enabled: !!vehicleId,
    select: (data) => {
      return data.map((v) => ({
        value: v.id,
        label: v.variant_name,
      }));
    },
  });
};
