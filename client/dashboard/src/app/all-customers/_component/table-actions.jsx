"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import useGetDealers from "@/hooks/use-get-dealers";

export default function TableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    roleFilter,
    setRoleFilter,
    dealerFilter,
    setDealerFilter,
    setSearchQuery,
    isAnyFilterActive,
  } = useTableFilters();

  const { data, isLoading, isError, error } = useGetDealers();
  console.log({ data });
  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey=""
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableFilterBox
        filterKey="role"
        title="Role"
        options={[
          { label: "Dealer", value: "dealer" },
          { label: "Customer", value: "customer" },
        ]}
        setFilterValue={setRoleFilter}
        filterValue={roleFilter}
      />
      <DataTableFilterBox
        filterKey="dealers"
        title="Dealers"
        options={data ?? []}
        setFilterValue={setDealerFilter}
        filterValue={dealerFilter}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
