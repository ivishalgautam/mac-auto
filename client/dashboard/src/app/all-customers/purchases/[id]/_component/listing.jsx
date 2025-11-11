"use client";
import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import { useGetCustomerPurchases } from "@/mutations/customer-mutation";
import { useAuth } from "@/providers/auth-provider";

export default function Listing() {
  const { id: customerId } = useParams();
  const { user } = useAuth();
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const { data, isLoading, isError, error } = useGetCustomerPurchases(
    searchParamsStr
      ? `${searchParamsStr}&customer=${customerId}`
      : searchParamsStr,
  );

  useEffect(() => {
    if (!searchParamsStr) {
      const params = new URLSearchParams();
      params.set("page", 1);
      params.set("limit", 10);
      router.replace(`?${params.toString()}`);
    }
  }, [searchParamsStr, router]);

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input w-full rounded-lg">
      <DataTable
        columns={columns(setId, user)}
        data={data?.inventory ?? []}
        totalItems={data?.total}
      />
    </div>
  );
}
