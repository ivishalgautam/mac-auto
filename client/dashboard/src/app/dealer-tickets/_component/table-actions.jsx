"use client";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableDatePickerWithRange } from "@/components/ui/table/data-table-date-range-selector";

export const ticketStatus = [
  {
    label: "Pending",
    value: "pending",
    className: "bg-red-500/10 text-red-400 border border-red-500/20",
  },
  {
    label: "In process",
    value: "in process",
    className: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
  },
  {
    label: "Resolved",
    value: "resolved",
    className: "bg-green-500/10 text-green-400 border border-green-500/20",
  },
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
    startDateFilter,
    setStartDateFilter,
    endDateFilter,
    setEndDateFilter,
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
        filterKey="status"
        title="Status"
        options={ticketStatus}
        setFilterValue={setStatusFilter}
        filterValue={statusFilter}
      />

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
