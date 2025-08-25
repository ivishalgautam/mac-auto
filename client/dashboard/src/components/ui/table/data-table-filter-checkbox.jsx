"use client";

import React from "react";
import { Checkbox } from "../checkbox";
import { Label } from "../label";

export function DataTableFilterCheckBox({
  filterKey,
  title,
  options,
  setFilterValue,
  filterValue,
}) {
  const selectedValuesSet = React.useMemo(() => {
    if (!filterValue) return new Set();
    const values = filterValue.split(".");
    return new Set(values.filter((value) => value !== ""));
  }, [filterValue]);

  const handleSelect = (value) => {
    const newSet = new Set(selectedValuesSet);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setFilterValue(Array.from(newSet).join(".") || null);
  };

  const resetFilter = () => setFilterValue(null);

  return (
    <div className="flex flex-wrap gap-3">
      {options.map((item) => (
        <div
          key={`${item.value}`}
          className="border-input has-data-[state=checked]:border-primary/50 relative flex cursor-pointer flex-col gap-4 rounded-md border p-3 shadow-xs outline-none"
        >
          <div className="flex justify-between gap-2">
            <Checkbox
              id={`${item.value}`}
              value={item.value}
              className="order-1 after:absolute after:inset-0"
              defaultChecked={item.defaultChecked}
              checked={filterValue.split(".")?.includes(item.value)}
              onCheckedChange={() => handleSelect(item.value)}
            />
            <Label htmlFor={`${item.value}`}>{item.label}</Label>
          </div>
        </div>
      ))}
    </div>
  );
}

//
