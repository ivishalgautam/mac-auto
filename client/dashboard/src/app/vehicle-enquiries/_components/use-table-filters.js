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
  const [type, setType] = useQueryState(
    "type",
    searchParams.q
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
    setType(null);
  }, [setSearchQuery, setPage, setType]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!type;
  }, [searchQuery, type]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    resetFilters,
    type,
    setType,
    isAnyFilterActive,
  };
}
