import {
  deleteWalkinEnquiry,
  fetchWalkinEnquiries,
  fetchWalkinEnquiry,
  updateWalkinEnquiry,
} from "@/services/enquiry";
import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetWalkInEnquiries = (searchParamStr = "") => {
  return useQuery({
    queryFn: () => fetchWalkinEnquiries(searchParamStr),
    queryKey: ["enquiries", searchParamStr],
    enabled: !!searchParamStr,
  });
};

export const useGetFormattedWalkInEnquiries = (searchParamStr = "") => {
  return useQuery({
    queryFn: async () => {
      const { data } = await http().get(
        `${endpoints.walkInEnquiries.getAll}?${searchParamStr}`,
      );
      return data;
    },
    queryKey: ["enquiries", searchParamStr],
    select: ({ enquiries }) => {
      return enquiries?.map((item) => ({
        value: item.id,
        label: `${item.enquiry_code} ${item.phone}`,
      }));
    },
  });
};
export const useGetWalkInEnquiry = (id) => {
  return useQuery({
    queryFn: () => fetchWalkinEnquiry(id),
    queryKey: ["enquiries", id],
    enabled: !!id,
  });
};

export const useUpdateWalkInEnquiryMutation = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => updateWalkinEnquiry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["enquiries"]);
      toast.success("Enquiry updated.");
      typeof callback === "function" && callback();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
};

export const useDeleteWalkInEnquiryMutation = (id, callback) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteWalkinEnquiry(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["enquiries"]);
      toast.success("Enquiry deleted.");

      typeof callback === "function" && callback();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });
};
