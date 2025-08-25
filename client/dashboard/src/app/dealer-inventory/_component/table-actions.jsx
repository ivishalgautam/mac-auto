"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { vehicleCategories } from "@/data";
import { DataTableFilterCheckBox } from "@/components/ui/table/data-table-filter-checkbox";

export default function TableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    categoryFilter,
    setCategoryFilter,
    setSearchQuery,
    isAnyFilterActive,
  } = useTableFilters();

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey=""
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      {/* <DataTableFilterCheckBox
        filterKey="category"
        title="Category"
        options={vehicleCategories}
        setFilterValue={setCategoryFilter}
        filterValue={categoryFilter}
      /> */}
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
