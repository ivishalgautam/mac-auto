import vehicleEnquiry from "@/services/vehicle-enquiry";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateVehicleEnquiry(callback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleEnquiry.create,
    onSuccess: () => {
      toast.success("Enquiry sent successfully.");
      queryClient.invalidateQueries(["vehicle-enquiries"]);
      typeof callback === "function" && callback();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Something went wrong!",
      );
    },
  });
}

export function useFetchVehicleEnquiries(searchParamStr = "") {
  return useQuery({
    queryFn: () => vehicleEnquiry.get(searchParamStr),
    queryKey: ["vehicle-enquiries", searchParamStr],
    enabled: !!searchParamStr,
  });
}

export function useGetVehicleEnquiry(enquiryId) {
  const queryClient = useQueryClient();

  return useQuery({
    queryFn: () => vehicleEnquiry.getById(enquiryId),
    queryKey: ["vehicle-enquiries", enquiryId],
    enabled: !!enquiryId,
  });
}

export function useDeleteVehicleEnquiry(vehicleId, callback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => vehicleEnquiry.deleteById(vehicleId),
    onSuccess: () => {
      toast.success("Enquiry deleted successfully.");
      queryClient.invalidateQueries(["vehicle-enquiries", vehicleId]);
      typeof callback === "function" && callback();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Something went wrong!",
      );
    },
  });
}

export function useUpdateVehicleEnquiry(id, callback) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => vehicleEnquiry.update(id, data),
    onSuccess: () => {
      toast.success("Enquiry updated successfully.");
      queryClient.invalidateQueries(["vehicle-enquiries", id]);
      typeof callback === "function" && callback();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Something went wrong!",
      );
    },
  });
}
