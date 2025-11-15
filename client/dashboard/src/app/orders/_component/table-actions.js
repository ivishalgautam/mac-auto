"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { orderStatuses } from "../columns";
import { DataTableDatePickerWithRange } from "@/components/ui/table/data-table-date-range-selector";
import useGetDealers from "@/hooks/use-get-dealers";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorMessage from "@/components/ui/error";
import { useAuth } from "@/providers/auth-provider";
import { ROLES } from "@/data/routes";

export default function TableActions() {
  const {
    resetFilters,
    searchQuery,
    setPage,
    statusFilter,
    setStatusFilter,
    setSearchQuery,
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
    dealerFilter,
    setDealerFilter,
    isAnyFilterActive,
  } = useTableFilters();

  const { data, isLoading, isError, error } = useGetDealers();
  const { user } = useAuth();

  return (
    <div className="my-3 flex flex-wrap items-center gap-3">
      <DataTableSearch
        searchKey="name"
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        setPage={setPage}
      />
      <DataTableFilterBox
        filterKey="status"
        title="Status"
        options={orderStatuses}
        setFilterValue={setStatusFilter}
        filterValue={statusFilter}
      />
      {isLoading ? (
        <Skeleton className={"h-10 w-32"} />
      ) : isError ? (
        <ErrorMessage error={error} />
      ) : (
        user &&
        [ROLES.ADMIN, ROLES.CRE, ROLES.MANAGER].includes(user?.role) && (
          <DataTableFilterBox
            filterKey="dealers"
            title="Dealers"
            options={data ?? []}
            setFilterValue={setDealerFilter}
            filterValue={dealerFilter}
          />
        )
      )}
      <DataTableDatePickerWithRange
        startDate={startDateFilter}
        setStartDate={setStartDateFilter}
        endDate={endDateFilter}
        setEndDate={setEndDateFilter}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
