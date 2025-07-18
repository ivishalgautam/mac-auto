import query from "@/services/query";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetQueries = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["queries", searchParams],
    queryFn: () => query.get(searchParams),
    enabled: !!searchParams,
  });
};

export const useGetQuery = (id) => {
  return useQuery({
    queryKey: ["queries", id],
    queryFn: () => query.getById(id),
    enabled: !!id,
  });
};

export const useCreateQuery = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: query.create,
    onSuccess: () => {
      toast("Query created successfully.");
      queryClient.invalidateQueries(["queries"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateQuery = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => query.update(id, data),
    onSuccess: () => {
      toast("Query updated successfully.");
      queryClient.invalidateQueries(["queries"]);
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

export const useDeleteQuery = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => query.deleteById(id),
    onSuccess: () => {
      toast("Query deleted successfully.");

      queryClient.invalidateQueries(["queries"]);
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
