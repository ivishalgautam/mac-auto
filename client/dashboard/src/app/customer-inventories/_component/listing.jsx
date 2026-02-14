"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import { useAuth } from "@/providers/auth-provider";
import {
  useCreateCustomerInventory,
  useCustomerInventories,
  useDeleteCustomerInventory,
  useUpdateCustomerInventory,
} from "@/mutations/use-customer-inventories";
import { FormDialog } from "@/components/form-dialog";
import CustomerInventoryForm from "@/components/forms/customer-inventory-form";
import { DeleteDialog } from "@/components/delete-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Listing() {
  const { user } = useAuth();
  const [isModal, setIsModal] = useState(false);
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = (type) => {
    if (type === "create") setIsModal(true);
    if (type === "delete") setIsDeleteModal(true);
    if (type === "edit") setIsUpdateModal(true);
  };
  const closeModal = (type) => {
    if (type === "create") setIsModal(false);
    if (type === "delete") setIsDeleteModal(false);
    if (type === "edit") setIsUpdateModal(false);
  };

  const { data, isLoading, isError, error } =
    useCustomerInventories(searchParamsStr);

  const createMutation = useCreateCustomerInventory(() => closeModal("create"));
  const updateMutation = useUpdateCustomerInventory(id, () =>
    closeModal("edit"),
  );
  const deleteMutation = useDeleteCustomerInventory(id, () =>
    closeModal("delete"),
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
      <div className="mb-2 text-end">
        <Button type="button" size={"sm"} onClick={() => setIsModal(true)}>
          <Plus />
          Add
        </Button>
      </div>

      <DataTable
        columns={columns(setId, openModal, user)}
        data={data?.inventory ?? []}
        totalItems={data?.total}
      />

      <FormDialog open={isModal} setOpen={setIsModal}>
        <CustomerInventoryForm
          createMutation={createMutation}
          type={"create"}
        />
      </FormDialog>

      <FormDialog open={isUpdateModal} setOpen={setIsUpdateModal}>
        <CustomerInventoryForm
          updateMutation={updateMutation}
          type={"edit"}
          id={id}
        />
      </FormDialog>

      <DeleteDialog
        isOpen={isDeleteModal}
        setIsOpen={setIsDeleteModal}
        deleteMutation={deleteMutation}
      />
    </div>
  );
}
