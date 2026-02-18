import { searchParams } from "@/lib/searchparams";
import { parseAsString, useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";

export function useTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault(""),
  );

  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withDefault(1),
  );
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    searchParams.status.withDefault(""),
  );
  const [dealerFilter, setDealerFilter] = useQueryState(
    "dealers",
    searchParams.role.withDefault(""),
  );
  const [techniciansFilter, setTechniciansFilter] = useQueryState(
    "technicians",
    parseAsString.withDefault(""),
  );

  const [startDateFilter, setStartDateFilter] = useQueryState(
    "start_date",
    parseAsString.withDefault(""),
  );
  const [endDateFilter, setEndDateFilter] = useQueryState(
    "end_date",
    parseAsString.withDefault(""),
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setStatusFilter(null);
    setStartDateFilter(null);
    setEndDateFilter(null);
    setDealerFilter(null);
    setTechniciansFilter(null);

    setPage(1);
  }, [
    setSearchQuery,
    setStatusFilter,
    setPage,
    setStartDateFilter,
    setEndDateFilter,
    setDealerFilter,
    setTechniciansFilter,
  ]);

  const isAnyFilterActive = useMemo(() => {
    return (
      !!searchQuery ||
      !!statusFilter ||
      !!startDateFilter ||
      !!endDateFilter ||
      !!dealerFilter ||
      !!techniciansFilter
    );
  }, [
    searchQuery,
    statusFilter,
    startDateFilter,
    endDateFilter,
    dealerFilter,
    techniciansFilter,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    resetFilters,
    isAnyFilterActive,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    dealerFilter,
    setDealerFilter,
    setTechniciansFilter,
    techniciansFilter,
  };
}
