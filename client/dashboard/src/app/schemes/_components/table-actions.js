"use client";
import { DataTableSearch } from "@/components/ui/table/data-table-search";
import { useTableFilters } from "./use-table-filters";
import { DataTableResetFilter } from "@/components/ui/table/data-table-reset-filter";
import { DataTableFilterBox } from "@/components/ui/table/data-table-filter-box";
import { DataTableDatePickerWithRange } from "@/components/ui/table/data-table-date-range-selector";

export default function TableActions() {
  const {
    isAnyFilterActive,
    resetFilters,
    searchQuery,
    setPage,
    setSearchQuery,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
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
        title={"Type"}
        filterKey={"type"}
        options={[
          { label: "IPO", value: "ipo" },
          { label: "Share", value: "share" },
        ]}
        setFilterValue={setType}
        filterValue={type}
      /> */}
      <DataTableDatePickerWithRange
        {...{ startDate, setStartDate, endDate, setEndDate }}
      />
      <DataTableResetFilter
        isFilterActive={isAnyFilterActive}
        onReset={resetFilters}
      />
    </div>
  );
}
