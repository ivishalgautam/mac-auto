import {
  createTicketUpdate,
  deleteTicketUpdate,
  getTicketUpdate,
  getTicketUpdates,
  getTicketUpdatesByTicket,
  updateTicketUpdate,
} from "@/services/ticket-update";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useTicketsUpdates = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["ticket-updates", searchParams],
    queryFn: () => getTicketUpdates(searchParams),
    enabled: !!searchParams,
  });
};

export const useTicketsUpdatesByTicket = (ticketId) => {
  return useQuery({
    queryKey: ["ticket-updates", ticketId],
    queryFn: () => getTicketUpdatesByTicket(ticketId),
    enabled: !!ticketId,
  });
};

export const useTicketUpdate = (id) => {
  return useQuery({
    queryKey: ["ticket-updates", id],
    queryFn: () => getTicketUpdate(id),
    enabled: !!id,
  });
};

export const useCreateTicketUpdate = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicketUpdate,
    onSuccess: () => {
      toast("Ticket update created successfully.");
      queryClient.invalidateQueries(["ticket-updates"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateTicketUpdate = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateTicketUpdate(id, data),
    onSuccess: () => {
      toast("Ticket update updated successfully.");
      queryClient.invalidateQueries(["ticket-updates"]);
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

export const useDeleteTicketUpdate = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTicketUpdate(id),
    onSuccess: () => {
      toast("Ticket update deleted successfully.");

      queryClient.invalidateQueries(["ticket-updates"]);
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
