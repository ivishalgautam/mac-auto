"use client";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { purchaseTypes, walkinEnquiriesStatus } from "@/data";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorMessage from "@/components/ui/error";
import useGetDealers from "@/hooks/use-get-dealers";

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
    dealerFilter,
    setDealerFilter,
  } = useTableFilters();

  const { data, isLoading, isError, error } = useGetDealers();

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey="name"
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
        title={"Purchase type"}
        filterKey={"mode"}
        options={purchaseTypes}
        setFilterValue={setMode}
        filterValue={mode}
      />

      {isLoading ? (
        <Skeleton className={"h-10 w-32"} />
      ) : isError ? (
        <ErrorMessage error={error} />
      ) : (
        <DataTableFilterBox
          filterKey="dealers"
          title="Dealers"
          options={data ?? []}
          setFilterValue={setDealerFilter}
          filterValue={dealerFilter}
        />
      )}

      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
