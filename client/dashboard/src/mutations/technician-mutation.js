import technicians from "@/services/technician";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetTechnicians = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["technicians", searchParams],
    queryFn: () => technicians.get(searchParams),
    enabled: !!searchParams,
  });
};
export const useGetFormattedTechnicians = () => {
  return useQuery({
    queryKey: ["technicians"],
    queryFn: () => technicians.get(""),
    select: ({ technicians = [] }) => {
      return (
        technicians?.map((t) => ({
          value: t.id,
          label: t.technician_name,
        })) ?? []
      );
    },
  });
};

export const useGetTechnician = (id) => {
  return useQuery({
    queryKey: ["technicians", id],
    queryFn: () => technicians.getById(id),
    enabled: !!id,
  });
};

export const useCreateTechnician = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: technicians.create,
    onSuccess: () => {
      toast("Technician added successfully.");
      queryClient.invalidateQueries(["technicians"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateTechnician = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => technicians.update(id, data),
    onSuccess: () => {
      toast.success("Technician updated successfully.");
      queryClient.invalidateQueries(["technicians"]);
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

export const useDeleteTechnician = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => technicians.deleteById(id),
    onSuccess: () => {
      toast("Technician deleted successfully.");

      queryClient.invalidateQueries(["technicians"]);
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
