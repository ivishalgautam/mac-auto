import {
  createCustomerInventory,
  deleteCustomerInventory,
  getCustomerInventories,
  getCustomerInventory,
  updateCustomerInventory,
} from "@/services/customer-inventory-services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useCustomerInventories = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["customer-inventories", searchParams],
    queryFn: () => getCustomerInventories(searchParams),
  });
};

export const useFormattedCustomerInventories = (searchParams = "page=1") => {
  return useQuery({
    queryKey: ["customer-inventories", searchParams],
    queryFn: () => getCustomerInventories(searchParams),
    select: ({ inventory }) => {
      return (
        inventory?.map((inv) => ({
          value: inv.id,
          label: `${inv.title} (${inv.chassis_no})`.trim(),
        })) ?? []
      );
    },
  });
};

export const useCustomerInventory = (id) => {
  return useQuery({
    queryKey: ["customer-inventories", id],
    queryFn: () => getCustomerInventory(id),
    enabled: !!id,
  });
};

export const useCreateCustomerInventory = (callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomerInventory,
    onSuccess: () => {
      toast("Customer inventory created successfully.");
      queryClient.invalidateQueries(["customer-inventories"]);
      callback?.();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useUpdateCustomerInventory = (id, callback = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateCustomerInventory(id, data),
    onSuccess: () => {
      toast("Customer inventory updated successfully.");
      queryClient.invalidateQueries(["customer-inventories"]);
      callback?.();
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};

export const useDeleteCustomerInventory = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteCustomerInventory(id),
    onSuccess: () => {
      toast("Customer inventory deleted successfully.");

      queryClient.invalidateQueries(["customer-inventories"]);
      callback?.();
    },
    onError: (error) => {
      console.error("Mutation Error:", error);
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};
