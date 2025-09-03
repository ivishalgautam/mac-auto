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
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    searchParams.status.withDefault(""),
  );
  const [colorFilter, setColorFilter] = useQueryState(
    "colors",
    searchParams.colors.withDefault(""),
  );
  const [variantFilter, setVariantFilter] = useQueryState(
    "variants",
    searchParams.variants.withDefault(""),
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setStatusFilter(null);
    setColorFilter(null);
    setVariantFilter(null);

    setPage(1);
  }, [
    setSearchQuery,
    setStatusFilter,
    setColorFilter,
    setVariantFilter,
    setPage,
  ]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!statusFilter || !!colorFilter || !!variantFilter;
  }, [searchQuery, statusFilter, colorFilter, variantFilter]);

  return {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    statusFilter,
    setStatusFilter,
    resetFilters,
    isAnyFilterActive,
    colorFilter,
    setColorFilter,
    variantFilter,
    setVariantFilter,
  };
}
