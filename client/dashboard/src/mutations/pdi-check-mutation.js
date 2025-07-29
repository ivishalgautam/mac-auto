import pdiCheck from "@/services/pdi-check";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetPDICheck = (id) => {
  return useQuery({
    queryKey: ["pdi-checks", id],
    queryFn: () => pdiCheck.getById(id),
    enabled: !!id,
  });
};

export const useCreatePDICheck = (orderId, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => pdiCheck.create(orderId, data),
    onSuccess: () => {
      toast("PDI Check created successfully.");
      queryClient.invalidateQueries(["pdi-checks"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdatePDICheck = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => pdiCheck.update(id, data),
    onSuccess: () => {
      toast("PDI Check updated successfully.");
      queryClient.invalidateQueries(["pdi-checks"]);
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

export const useDeletePDICheck = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => pdiCheck.deleteById(id),
    onSuccess: () => {
      toast("PDI Check deleted successfully.");

      queryClient.invalidateQueries(["pdi-checks"]);
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
