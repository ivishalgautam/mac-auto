import dealer from "@/services/dealer";
import { useQuery } from "@tanstack/react-query";

export function useGetDealers(searchParams) {
  return useQuery({
    queryKey: ["dealers", searchParams],
    queryFn: () => dealer.get(searchParams),
  });
}

export function useGetFormattedDealers() {
  return useQuery({
    queryKey: ["dealers"],
    queryFn: () => dealer.get(""),
    select: ({ dealers = [] }) => {
      return dealers.map((dealer) => ({
        value: dealer.id,
        label: dealer.fullname,
      }));
    },
  });
}
