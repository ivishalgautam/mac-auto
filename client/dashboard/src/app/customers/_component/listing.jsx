"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import { useGetDealerCustomers } from "@/mutations/customer-mutation";
import { useDeleteUser } from "@/mutations/user-mutation";
import { DeleteDialog } from "./delete-dialog";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useAuth } from "@/providers/auth-provider";
import { Plus } from "lucide-react";
import TableActions from "./table-actions";

export default function Listing() {
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const { user } = useAuth();

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

  const { data, isLoading, isError, error } =
    useGetDealerCustomers(searchParamsStr);
  const deleteMutation = useDeleteUser(userId, () => closeModal("delete"));

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
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={user?.role === "dealer" ? "My Customers" : "Customers"}
          description="Manage customers (Create, Update, Delete)."
        />
        <Link
          href="/customers/create"
          className={buttonVariants({ size: "sm" })}
        >
          <Plus size="15" /> Add customer
        </Link>
      </div>
      <TableActions />
      <div className="border-input w-full rounded-lg">
        <DataTable
          columns={columns(setUserId, openModal, user)}
          data={data?.customers ?? []}
          totalItems={data?.total}
        />
        <DeleteDialog
          deleteMutation={deleteMutation}
          isOpen={isDeleteModal}
          setIsOpen={setIsDeleteModal}
        />
      </div>
    </>
  );
}
