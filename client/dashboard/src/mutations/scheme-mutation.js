import scheme from "@/services/scheme";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetSchemes = (searchParams) => {
  return useQuery({
    queryFn: () => scheme.get(searchParams),
    queryKey: ["schemes", searchParams],
    enabled: !!searchParams,
  });
};

export const useGetScheme = (id) => {
  return useQuery({
    queryFn: () => scheme.getById(id),
    queryKey: ["schemes", id],
    enabled: !!id,
  });
};

export const useCreateScheme = (onSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: scheme.create,
    onSuccess: () => {
      toast.success("Scheme created.");
      queryClient.invalidateQueries(["schemes"]);
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
};

export const useUpdateScheme = (id, onSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => scheme.update(id, data),
    onSuccess: () => {
      toast.success("Scheme updated.");
      queryClient.invalidateQueries(["schemes"]);
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
};

export const useDeleteSchemeMutation = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => scheme.deleteById(id),
    onSuccess: () => {
      toast.success("Scheme deleted.");
      queryClient.invalidateQueries(["schemes"]);
      typeof callback === "function" && callback();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
};
