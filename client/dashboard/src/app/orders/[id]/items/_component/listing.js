"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "../columns";
import { DeleteDialog } from "./delete-dialog";
import ErrorMessage from "@/components/ui/error";
import {
  useDeleteOrderItem,
  useOrderItems,
  useUpdateOrderItem,
} from "@/mutations/use-orders";

export default function Listing({ orderId }) {
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const { data, isLoading, isError, error } = useOrderItems(
    orderId,
    searchParamsStr,
  );
  const updateMutation = useUpdateOrderItem(orderId, id, () => {});
  const deleteMutation = useDeleteOrderItem(id, () => {
    setIsModal(false);
  });
  const openModal = () => setIsModal(true);

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input w-full rounded-lg">
      <DataTable
        columns={columns(openModal, setId, updateMutation)}
        data={data?.items ?? []}
        totalItems={data?.total ?? 0}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
      />
    </div>
  );
}
