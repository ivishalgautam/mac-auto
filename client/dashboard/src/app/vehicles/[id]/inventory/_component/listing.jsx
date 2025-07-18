"use client";
import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import {
  useDeleteInventory,
  useGetInventoryByVehicleId,
  useUpdateInventoryItem,
} from "@/mutations/inventory.mutation";
import { UpdateDialog } from "./update-dialog";

export default function Listing({ vehicleId }) {
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = (type) => {
    if (type === "edit") {
      setIsUpdateModal(true);
    }
  };

  const { data, isLoading, isError, error } = useGetInventoryByVehicleId(
    vehicleId,
    searchParamsStr,
  );

  const deleteMutation = useDeleteInventory(id);
  const updateMutation = useUpdateInventoryItem(id);
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
        columns={columns(openModal, updateMutation, setId)}
        data={data?.inventory ?? []}
        totalItems={data?.total}
      />
      <UpdateDialog
        id={id}
        isOpen={isUpdateModal}
        setIsOpen={setIsUpdateModal}
      />
    </div>
  );
}
