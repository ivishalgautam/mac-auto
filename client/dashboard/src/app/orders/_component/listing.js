"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "../columns";
import { DeleteDialog } from "./delete-dialog";
import ErrorMessage from "@/components/ui/error";
import {
  useDeleteOrder,
  useOrders,
  useUpdateOrder,
} from "@/mutations/use-orders";
import { useAuth } from "@/providers/auth-provider";

export default function Listing() {
  const { user } = useAuth();
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const { data, isLoading, isError, error } = useOrders(searchParamsStr);
  const deleteMutation = useDeleteOrder(id, () => {
    setIsModal(false);
  });
  const updateMutation = useUpdateOrder(id, () => {});

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input w-full rounded-lg">
      <DataTable
        columns={columns(setId, updateMutation, user, () => setIsModal(true))}
        data={data?.orders ?? []}
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
