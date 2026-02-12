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

  const [dealerFilter, setDealerFilter] = useQueryState(
    "dealers",
    searchParams.role.withDefault(""),
  );

  const [mode, setMode] = useQueryState(
    "mode",
    searchParams.mode
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault(""),
  );
  const [status, setStatus] = useQueryState(
    "status",
    searchParams.status
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault(""),
  );

  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withDefault(1),
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setPage(1);
    setMode(null);
    setStatus(null);
    setDealerFilter(null);
  }, [setSearchQuery, setPage, setDealerFilter, setMode, setStatus]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!mode || !!status || !!dealerFilter;
  }, [searchQuery, mode, status]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    mode,
    setMode,
    status,
    setStatus,
    isAnyFilterActive,
    dealerFilter,
    setDealerFilter,
  };
}
