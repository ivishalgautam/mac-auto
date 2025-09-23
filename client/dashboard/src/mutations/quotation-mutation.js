import quotation from "@/services/quotation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetQuotations = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["quotations", searchParams],
    queryFn: () => quotation.get(searchParams),
    enabled: !!searchParams,
  });
};

export const useGetQuotation = (id) => {
  return useQuery({
    queryKey: ["quotations", id],
    queryFn: () => quotation.getById(id),
    enabled: !!id,
  });
};

export const useCreateQuotation = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: quotation.create,
    onSuccess: () => {
      toast("Quotation added successfully.");
      queryClient.invalidateQueries(["quotations"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateQuotation = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => quotation.update(id, data),
    onSuccess: () => {
      toast.success("Quotation updated successfully.");
      queryClient.invalidateQueries(["quotations"]);
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

export const useConvertQuotationToInvoice = (id, handleSuccess = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => quotation.convertToInvoice(id, data),
    onSuccess: () => {
      toast.success("Invoice created.");
      queryClient.invalidateQueries(["quotations"]);
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

export const useDeleteQuotation = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => quotation.deleteById(id),
    onSuccess: () => {
      toast("Quotation deleted successfully.");

      queryClient.invalidateQueries(["quotations"]);
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
