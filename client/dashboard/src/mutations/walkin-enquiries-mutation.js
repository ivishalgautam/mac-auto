import {
  deleteWalkinEnquiry,
  fetchWalkinEnquiries,
  updateWalkinEnquiry,
} from "@/services/enquiry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetWalkInEnquiries = (searchParamStr = "") => {
  return useQuery({
    queryFn: () => fetchWalkinEnquiries(searchParamStr),
    queryKey: ["enquiries", searchParamStr],
    enabled: !!searchParamStr,
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
