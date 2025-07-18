import financer from "@/services/financer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetFinancers = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["financers", searchParams],
    queryFn: () => financer.getFinancers(searchParams),
    enabled: !!searchParams,
  });
};

export const useGetFinancer = (id) => {
  return useQuery({
    queryKey: ["financers", id],
    queryFn: () => financer.getFinancer(id),
    enabled: !!id,
  });
};

export const useCreateFinancer = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: financer.create,
    onSuccess: () => {
      toast("Financer added successfully.");
      queryClient.invalidateQueries(["financers"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateFinancer = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => financer.update(id, data),
    onSuccess: () => {
      toast("Financer updated successfully.");
      queryClient.invalidateQueries(["financers"]);
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

export const useDeleteFinancer = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => financer.deleteById(id),
    onSuccess: () => {
      toast("Financer deleted successfully.");

      queryClient.invalidateQueries(["financers"]);
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
