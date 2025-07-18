import dealer from "@/services/dealer";
import { useQuery } from "@tanstack/react-query";

export default function useGetDealers() {
  return useQuery({
    queryKey: ["dealers"],
    queryFn: () => dealer.get(""),
    select: ({ dealers = [] }) => {
      return dealers.map((dealer) => ({
        value: dealer.id,
        label: `${dealer.fullname} (${dealer.location})`,
      }));
    },
  });
}
