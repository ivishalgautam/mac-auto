import vehicle from "@/services/vehicle";
import { useQuery } from "@tanstack/react-query";

export default function useFetchVehicles() {
  return useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehicle.get(`type=main`),
    select: ({ vehicles = [] }) => {
      return vehicles.map((vehicle) => ({
        value: vehicle.id,
        label: vehicle.title,
      }));
    },
  });
}
