"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";

export default function TableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    roleFilter,
    setRoleFilter,
    setSearchQuery,
    isAnyFilterActive,
  } = useTableFilters();

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="name"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      {/* <DataTableFilterBox
        filterKey="role"
        title="Role"
        options={[
          { label: "Patient", value: "patient" },
          { label: "Doctor", value: "doctor" },
        ]}
        setFilterValue={setRoleFilter}
        filterValue={roleFilter}
      /> */}
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
