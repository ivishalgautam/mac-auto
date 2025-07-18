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

  const [page, setPage] = useQueryState(
    "page",
    searchParams.page.withDefault(1),
  );
  const [categoryFilter, setCategoryFilter] = useQueryState(
    "category",
    searchParams.category.withDefault(""),
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setCategoryFilter(null);

    setPage(1);
  }, [setSearchQuery, setCategoryFilter, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!categoryFilter;
  }, [searchQuery, categoryFilter]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    categoryFilter,
    setCategoryFilter,
    resetFilters,
    isAnyFilterActive,
  };
}
