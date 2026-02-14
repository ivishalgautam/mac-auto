import customer from "@/services/customer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useGetCustomers(searchParams) {
  return useQuery({
    queryKey: ["customers", searchParams],
    queryFn: () => customer.get(searchParams),
  });
}

export function useGetCustomer(customerId) {
  return useQuery({
    queryKey: ["customers", customerId],
    queryFn: () => customer.getById(customerId),
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
        label: customer.fullname.trim(),
        phone: customer.mobile_number,
      }));
    },
  });
}
export function useGetCustomerPurchases(searchParams = "") {
  return useQuery({
    queryKey: ["customers-purchases", searchParams],
    queryFn: () => customer.getCustomerPurchases(searchParams),
  });
}
export function useGetFormattedPurchasesByCustomer(customerId = "") {
  return useQuery({
    queryKey: ["customers-purchases", customerId],
    queryFn: () => customer.getCustomerPurchases(`customer=${customerId}`),
    // enabled: !!customerId,
    select: ({ inventory = [] }) => {
      return inventory.map((purchase) => ({
        value: purchase.id,
        label: `${purchase.title} (${purchase.chassis_no})`,
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

export const useDeleteCustomer = (id, handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => customer.deleteById(id),
    onSuccess: () => {
      toast("Customer deleted successfully.");

      queryClient.invalidateQueries(["customers"]);
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
