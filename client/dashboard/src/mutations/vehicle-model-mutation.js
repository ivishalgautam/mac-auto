import vehicleModel from "@/services/vehicle-model";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ✅ Get all models (with pagination or filters)
export const useGetVehicleModels = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["vehicle-models", searchParams],
    queryFn: () => vehicleModel.get(searchParams),
    enabled: !!searchParams,
  });
};
export const useGetFormattedVehicleModels = () => {
  return useQuery({
    queryKey: ["vehicle-models"],
    queryFn: () => vehicleModel.get(""),

    select: ({ models }) => {
      return (
        models?.map(({ model_name: label, id: value }) => ({
          label,
          value,
        })) ?? []
      );
    },
  });
};

// ✅ Get single model
export const useGetVehicleModel = (id) => {
  return useQuery({
    queryKey: ["vehicle-model", id],
    queryFn: () => vehicleModel.getById(id),
    enabled: !!id,
  });
};

// ✅ Bulk create
export const useBulkCreateVehicleModel = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => vehicleModel.bulkCreate(data),
    onSuccess: () => {
      toast.success("Vehicle models added successfully.");
      queryClient.invalidateQueries(["vehicle-models"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "An error occurred while adding models",
      );
    },
  });
};

// ✅ Update single model
export const useUpdateVehicleModel = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => vehicleModel.update(id, data),
    onSuccess: () => {
      toast.success("Vehicle model updated successfully.");
      queryClient.invalidateQueries(["vehicle-models"]);
      queryClient.invalidateQueries(["vehicle-model", id]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "An error occurred while updating model",
      );
    },
  });
};

// ✅ Delete single model
export const useDeleteVehicleModel = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vehicleModel.deleteById(id),
    onSuccess: () => {
      toast.success("Vehicle model deleted successfully.");
      queryClient.invalidateQueries(["vehicle-models"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "An error occurred while deleting model",
      );
    },
  });
};
