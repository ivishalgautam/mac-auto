import ticket from "@/services/ticket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetTickets = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["tickets", searchParams],
    queryFn: () => ticket.get(searchParams),
    enabled: !!searchParams,
  });
};

export const useGetTicket = (id) => {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => ticket.getById(id),
    enabled: !!id,
  });
};

export const useCreateTicket = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ticket.create,
    onSuccess: () => {
      toast("Ticket added successfully.");
      queryClient.invalidateQueries(["tickets"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateTicket = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => ticket.update(id, data),
    onSuccess: () => {
      toast.success("Ticket updated successfully.");
      queryClient.invalidateQueries(["tickets"]);
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

export const useDeleteTicket = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => ticket.deleteById(id),
    onSuccess: () => {
      toast("Ticket deleted successfully.");

      queryClient.invalidateQueries(["tickets"]);
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
