"use client";
import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useDeleteVehicleModel,
  useGetVehicleModels,
  useUpdateVehicleModel,
} from "@/mutations/vehicle-model-mutation";
import { useAuth } from "@/providers/auth-provider";
import { columns } from "../column";
import { DeleteDialog } from "./delete-dialog";

export default function Listing() {
  const { user } = useAuth();
  const [isModal, setIsModal] = useState(false);
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = () => setIsModal(true);
  const closeModal = () => setIsModal(false);

  const { data, isLoading, isError, error } =
    useGetVehicleModels(searchParamsStr);
  const deleteMutation = useDeleteVehicleModel(id, closeModal);
  const updateMutation = useUpdateVehicleModel(id);

  console.log({ data });

  useEffect(() => {
    if (!searchParamsStr) {
      const params = new URLSearchParams();
      params.set("page", "1");
      params.set("limit", "10");
      router.replace(`?${params.toString()}`);
    }
  }, [searchParamsStr, router]);

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;
  if (isError) return <ErrorMessage error={error?.message ?? "error"} />;

  return (
    <div className="border-input w-full rounded-lg">
      <DataTable
        columns={columns(updateMutation, setId, openModal, user)}
        data={data?.models ?? []}
        totalItems={data?.total}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
      />
    </div>
  );
}
