"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";

export const statusOptions = [
  { label: "In Process", value: "in process" },
  { label: "Dispatch", value: "dispatch" },
  { label: "Canceled", value: "canceled" },
  { label: "Delivered", value: "delivered" },
];

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
      {/* <DataTableFilterBox
        filterKey="category"
        title="Category"
        options={[
          { label: "Passenger", value: "passenger" },
          { label: "Cargo", value: "cargo" },
          { label: "Garbage", value: "garbage" },
        ]}
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
