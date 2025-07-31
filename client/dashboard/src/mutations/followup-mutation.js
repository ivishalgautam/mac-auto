import followup from "@/services/followup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetFollowups = (searchParams) => {
  return useQuery({
    queryFn: () => followup.get(searchParams),
    queryKey: ["follow-ups", searchParams],
    enabled: !!searchParams,
  });
};

export const useGetFollowup = (id) => {
  return useQuery({
    queryFn: () => followup.getById(id),
    queryKey: ["follow-ups", id],
    enabled: !!id,
  });
};

export const useCreateFollowUp = (onSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followup.create,
    onSuccess: () => {
      toast.success("Follow up created.");
      queryClient.invalidateQueries(["follow-ups"]);
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
};

export const useUpdateFollowUp = (id, onSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => followup.update(id, data),
    onSuccess: () => {
      toast.success("Follow up updated.");
      queryClient.invalidateQueries(["follow-ups"]);
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
};

export const useDeleteFollowupMutation = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => followup.deleteById(id),
    onSuccess: () => {
      toast.success("Follow up deleted.");
      queryClient.invalidateQueries(["follow-ups"]);
      typeof callback === "function" && callback();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
};
