import dealerTicket from "@/services/dealer-ticket";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetDealerTickets = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["dealer-tickets", searchParams],
    queryFn: () => dealerTicket.get(searchParams),
    enabled: !!searchParams,
  });
};

export const useGetDealerTicket = (id) => {
  return useQuery({
    queryKey: ["dealer-tickets", id],
    queryFn: () => dealerTicket.getById(id),
    enabled: !!id,
  });
};

export const useGetDealerTicketDetails = (id) => {
  return useQuery({
    queryKey: ["dealer-tickets", id],
    queryFn: () => dealerTicket.getByDetailsId(id),
    enabled: !!id,
  });
};

export const useCreateDealerTicket = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dealerTicket.create,
    onSuccess: () => {
      toast("Ticket added successfully.");
      queryClient.invalidateQueries(["dealer-tickets"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateDealerTicket = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => dealerTicket.update(id, data),
    onSuccess: () => {
      toast.success("Ticket updated successfully.");
      queryClient.invalidateQueries(["dealer-tickets"]);
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

export const useDeleteDealerTicket = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dealerTicket.deleteById(id),
    onSuccess: () => {
      toast("Ticket deleted successfully.");

      queryClient.invalidateQueries(["dealer-tickets"]);
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
