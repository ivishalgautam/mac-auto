import { fetchEnquiry } from "@/services/enquiry";

export const useGetEnquiry = (id) => {
  return useQuery({
    queryFn: () => fetchEnquiry(id),
    queryKey: ["enquiries", id],
    enabled: !!id,
  });
};
