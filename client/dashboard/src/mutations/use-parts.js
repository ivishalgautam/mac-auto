import {
  createPart,
  deletePart,
  getPart,
  getParts,
  updatePart,
} from "@/services/part";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useParts = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["parts", searchParams],
    queryFn: () => getParts(searchParams),
    enabled: !!searchParams,
  });
};

export const useFormattedParts = () => {
  return useQuery({
    queryKey: ["formatted-parts"],
    queryFn: () => getParts(""),
    select: ({ parts }) => {
      return (
        parts?.map((part) => ({ label: part.part_name, value: part.id })) ?? []
      );
    },
  });
};

export const usePart = (id) => {
  return useQuery({
    queryKey: ["parts", id],
    queryFn: () => getPart(id),
    enabled: !!id,
  });
};

export const useCreatePart = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPart,
    onSuccess: () => {
      toast("Part created successfully.");
      queryClient.invalidateQueries(["parts"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdatePart = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updatePart(id, data),
    onSuccess: () => {
      toast("Part updated successfully.");
      queryClient.invalidateQueries(["parts"]);
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

export const useDeletePart = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deletePart(id),
    onSuccess: () => {
      toast("Part deleted successfully.");

      queryClient.invalidateQueries(["parts"]);
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
