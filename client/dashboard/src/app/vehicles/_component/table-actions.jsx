"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";

export default function TableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    categoryFilter,
    setCategoryFilter,
    setSearchQuery,
    isAnyFilterActive,
    statusFilter,
    setStatusFilter,
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
        filterKey="category"
        title="Category"
        options={[
          { label: "Passenger", value: "passenger" },
          { label: "Loader", value: "loader" },
          { label: "Garbage", value: "garbage" },
          { label: "E-Cycle", value: "e-cycle" },
          { label: "E-Scooter", value: "e-scooter" },
          { label: "Golf", value: "golf" },
        ]}
        setFilterValue={setCategoryFilter}
        filterValue={categoryFilter}
      />
      <DataTableFilterBox
        filterKey="status"
        title="Status"
        options={[
          { label: "Active", value: "active" },
          { label: "Inactive", value: "inactive" },
        ]}
        setFilterValue={setStatusFilter}
        filterValue={statusFilter}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
