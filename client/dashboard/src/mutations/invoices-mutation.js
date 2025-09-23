import invoice from "@/services/invoices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetInvoices = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["invoices", searchParams],
    queryFn: () => invoice.get(searchParams),
    enabled: !!searchParams,
  });
};

export const useGetInvoice = (id) => {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => invoice.getById(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invoice.create,
    onSuccess: () => {
      toast("Invoice added successfully.");
      queryClient.invalidateQueries(["invoices"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateInvoice = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => invoice.update(id, data),
    onSuccess: () => {
      toast.success("Invoice updated successfully.");
      queryClient.invalidateQueries(["invoices"]);
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

export const useDeleteInvoice = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => invoice.deleteById(id),
    onSuccess: () => {
      toast("Invoice deleted successfully.");

      queryClient.invalidateQueries(["invoices"]);
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
