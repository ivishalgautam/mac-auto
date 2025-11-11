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
  const [roleFilter, setRoleFilter] = useQueryState(
    "role",
    searchParams.role.withDefault(""),
  );
  const [dealerFilter, setDealerFilter] = useQueryState(
    "dealers",
    searchParams.role.withDefault(""),
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setRoleFilter(null);
    setDealerFilter(null);

    setPage(1);
  }, [setSearchQuery, setRoleFilter, setPage, setDealerFilter]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!roleFilter || !!dealerFilter;
  }, [searchQuery, roleFilter, dealerFilter]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    roleFilter,
    setRoleFilter,
    dealerFilter,
    setDealerFilter,
    resetFilters,
    isAnyFilterActive,
  };
}
