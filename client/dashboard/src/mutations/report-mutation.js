import report from "@/services/report";
import { useQuery } from "@tanstack/react-query";

export const useGetReports = () => {
  return useQuery({ queryFn: report.getReport, queryKey: ["reports"] });
};
