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
    setPage(1);
    setSearchQuery(null);
    setMode(null);
    setStatus(null);
  }, [setSearchQuery, setPage, setMode, setStatus]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!mode || !!status;
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
  };
}
