"use client";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { purchaseTypes, walkinEnquiriesStatus } from "@/data";

export default function TableActions() {
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    mode,
    setMode,
    status,
    setStatus,
  } = useTableFilters();

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey=""
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableFilterBox
        title={"Finance Status"}
        filterKey={"status"}
        options={walkinEnquiriesStatus}
        setFilterValue={setStatus}
        filterValue={status}
      />
      <DataTableFilterBox
        title={"Mode"}
        filterKey={"mode"}
        options={purchaseTypes}
        setFilterValue={setMode}
        filterValue={mode}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
