"use client";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";

export default function TableActions() {
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    type,
    setType,
  } = useTableFilters();

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="name"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
