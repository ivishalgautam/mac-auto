"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { colors } from "@/data";
import { useGetFormattedVehicleVariants } from "@/mutations/vehicle-variant-mutation";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorMessage from "@/components/ui/error";

export const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Sold", value: "sold" },
  { label: "Scrapped", value: "scrapped" },
];

export default function TableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    statusFilter,
    setStatusFilter,
    setSearchQuery,
    isAnyFilterActive,
    colorFilter,
    setColorFilter,
    variantFilter,
    setVariantFilter,
  } = useTableFilters();

  const { data, isLoading, isError, error } =
    useGetFormattedVehicleVariants("");

  return (
    <div className="my-3 flex flex-wrap items-center gap-4">
      <DataTableSearch
        searchKey=""
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableFilterBox
        filterKey="status"
        title="Status"
        options={statusOptions}
        setFilterValue={setStatusFilter}
        filterValue={statusFilter}
      />
      {isLoading ? (
        <Skeleton className={"h-9 w-28"} />
      ) : isError ? (
        <ErrorMessage error={error} />
      ) : (
        <DataTableFilterBox
          filterKey="variants"
          title="Variants"
          options={data}
          setFilterValue={setVariantFilter}
          filterValue={variantFilter}
        />
      )}
      <DataTableFilterBox
        filterKey="colors"
        title="Colors"
        options={colors}
        setFilterValue={setColorFilter}
        filterValue={colorFilter}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
