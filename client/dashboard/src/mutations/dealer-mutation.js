import dealer from "@/services/dealer";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export const useImportDealers = (handleSuccess) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dealer.importDealers,
    onSuccess: () => {
      toast("Dealers imported.");
      queryClient.invalidateQueries(["dealers"]);
      typeof handleSuccess === "function" && handleSuccess();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ?? error?.message ?? "An error occurred",
      );
    },
  });
};
