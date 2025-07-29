import customer from "@/services/customer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGetCustomers(searchParams) {
  return useQuery({
    queryKey: ["customers", searchParams],
    queryFn: () => customer.get(searchParams),
  });
}

export function useGetDealerCustomers(searchParams) {
  return useQuery({
    queryKey: ["dealer-customers", searchParams],
    queryFn: () => customer.getDealerCustomers(searchParams),
  });
}

export function useGetFormattedCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: () => customer.get(""),
    select: ({ customers = [] }) => {
      return customers.map((customer) => ({
        value: customer.id,
        label: customer.fullname,
      }));
    },
  });
}

export function useAssignCustomerToDealer(callback) {
  return useMutation({
    mutationFn: (data) => customer.assignToDealer(data),
    onSuccess: () => {
      toast.success("Assigned successfully.");
      typeof callback === "function" && callback();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
}
