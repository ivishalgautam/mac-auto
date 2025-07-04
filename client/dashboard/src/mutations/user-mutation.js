import user from "@/services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetUsers = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["users", searchParams],
    queryFn: () => user.get(searchParams),
    enabled: !!searchParams,
  });
};

export const useGetUserProfile = (id) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => user.getById(id),
    enabled: !!id,
  });
};

export const useGetUserCompanyProfile = (id) => {
  return useQuery({
    queryKey: ["user-company-profile", id],
    queryFn: () => user.getUserCompanyProfile(id),
    enabled: !!id,
  });
};

export const useGetUserContacts = (id) => {
  return useQuery({
    queryKey: ["user-key-contact", id],
    queryFn: () => user.getUserContacts(id),
    enabled: !!id,
  });
};

export const useGetUser = (id) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => user.getById(id),
    enabled: !!id,
  });
};

export const useCreateUser = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: user.create,
    onSuccess: () => {
      toast("User created successfully.");
      queryClient.invalidateQueries(["users"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateUser = (id) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => user.update(id, data),
    onSuccess: () => {
      toast("User updated successfully.");
      queryClient.invalidateQueries(["users"]);
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useDeleteUser = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => user.deleteById(id),
    onSuccess: () => {
      toast("User deleted successfully.");

      queryClient.invalidateQueries(["users"]);
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
