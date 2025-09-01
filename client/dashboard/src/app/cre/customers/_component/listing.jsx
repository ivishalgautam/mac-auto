"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import { AssignDealerDialog } from "./assign-dealer-dialog";
import {
  useAssignCustomerToDealer,
  useGetCustomers,
} from "@/mutations/customer-mutation";

export default function Listing() {
  const [isAssignDealerModal, setIsAssignDealerModal] = useState(false);
  const [id, setId] = useState("");
  const [customerId, setCustomerId] = useState(null);
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = (type) => {
    if (type === "assign-dealer") {
      setIsAssignDealerModal(true);
    }
  };
  const closeModal = (type) => {
    if (type === "assign-dealer") {
      setIsAssignDealerModal(false);
    }
  };

  const { data, isLoading, isError, error } = useGetCustomers(searchParamsStr);
  const assignToDealerMutation = useAssignCustomerToDealer(() =>
    closeModal("assign-dealer"),
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
  if (isError) return <ErrorMessage error={error?.message ?? "error"} />;

  return (
    <div className="border-input w-full rounded-lg">
      <DataTable
        columns={columns(setCustomerId, openModal)}
        data={data?.customers ?? []}
        totalItems={data?.total}
      />
      <AssignDealerDialog
        mutation={assignToDealerMutation}
        isOpen={isAssignDealerModal}
        setIsOpen={setIsAssignDealerModal}
        customerId={customerId}
      />
    </div>
  );
}
