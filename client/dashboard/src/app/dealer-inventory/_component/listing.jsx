"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import {
  useGetDealerInventory,
  useUpdateDealerInventoryItem,
} from "@/mutations/dealer-inventory.mutation";
import { CustomerOrderCreateDialog } from "./order-create-dialog";
import { useCreateCustomerOrder } from "@/mutations/customer-order-mutation";

export default function Listing() {
  const [isModal, setIsModal] = useState(false);
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = (type) => {
    if (type === "create-order") {
      setIsModal(true);
    }
  };
  const closeModal = (type) => {
    if (type === "create-order") {
      setIsModal(false);
    }
  };

  const { data, isLoading, isError, error } =
    useGetDealerInventory(searchParamsStr);
  const createMutation = useCreateCustomerOrder(() =>
    closeModal("create-order"),
  );
  const updateMutation = useUpdateDealerInventoryItem(id);

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
        columns={columns(setId, openModal)}
        data={data?.inventory ?? []}
        totalItems={data?.total}
      />

      <CustomerOrderCreateDialog
        isOpen={isModal}
        setIsOpen={setIsModal}
        createMutation={createMutation}
        vehicleId={id}
        maxSelect={1}
      />
    </div>
  );
}
