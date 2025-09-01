"use client";
import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import {
  useDeleteUser,
  useGetUsers,
  useUpdateUser,
} from "@/mutations/user-mutation";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import { UserDeleteDialog } from "./delete-dialog";

export default function UserListing() {
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [userId, setUserId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = (type) => {
    if (type === "delete") {
      setIsDeleteModal(true);
    }
  };
  const closeModal = (type) => {
    if (type === "delete") {
      setIsDeleteModal(false);
    }
  };

  const { data, isLoading, isError, error } = useGetUsers(searchParamsStr);
  const deleteMutation = useDeleteUser(userId, () => closeModal("delete"));
  const updateMutation = useUpdateUser(userId);

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
        columns={columns(updateMutation, setUserId, openModal)}
        data={data?.users ?? []}
        totalItems={data?.total}
      />
      <UserDeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isDeleteModal}
        setIsOpen={setIsDeleteModal}
      />
    </div>
  );
}
