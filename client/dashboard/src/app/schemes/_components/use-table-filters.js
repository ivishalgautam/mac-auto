import { searchParams } from "@/lib/searchparams";
import { useQueryState } from "nuqs";
import { useCallback, useMemo } from "react";

export function useTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    "q",
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault(""),
  );
  const [startDate, setStartDate] = useQueryState(
    "start_date",
    searchParams.start_date.withDefault(""),
  );

  const [endDate, setEndDate] = useQueryState(
    "end_date",
    searchParams.end_date.withDefault(""),
  );

  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withDefault(1),
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setStartDate(null);
    setEndDate(null);

    setPage(1);
  }, [setSearchQuery, setPage, setStartDate, setEndDate]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!startDate;
  }, [searchQuery, startDate]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    isAnyFilterActive,
  };
}
