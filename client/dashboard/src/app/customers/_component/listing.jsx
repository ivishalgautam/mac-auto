"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { columns } from "../columns";
import { useGetDealerCustomers } from "@/mutations/customer-mutation";

export default function Listing() {
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const { data, isLoading, isError, error } =
    useGetDealerCustomers(searchParamsStr);

  useEffect(() => {
    if (!searchParamsStr) {
      const params = new URLSearchParams();
      params.set("page", 1);
      params.set("limit", 10);
      router.replace(`?${params.toString()}`);
    }
  }, [searchParamsStr, router]);

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error?.message ?? "error"} />;

  return (
    <div className="border-input w-full rounded-lg">
      <DataTable
        columns={columns()}
        data={data?.customers ?? []}
        totalItems={data?.total}
      />
    </div>
  );
}
