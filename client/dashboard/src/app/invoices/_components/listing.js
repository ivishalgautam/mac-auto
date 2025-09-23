"use client";
import { columns } from "../columns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/table/data-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useAuth } from "@/providers/auth-provider";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "./delete-dialog";
import {
  useDeleteInvoice,
  useGetInvoices,
  useUpdateInvoice,
} from "@/mutations/invoices-mutation";

export default function Listing() {
  const { user } = useAuth();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [id, setId] = useState(null);

  const searchParams = useSearchParams();
  const searchParamStr = searchParams.toString();
  const router = useRouter();
  const pathname = usePathname();

  function openModal(type) {
    if (!type) return toast.warning("Please provide which modal should open!");
    if (type === "delete") {
      setIsDeleteOpen(true);
    }
  }

  const { data, isLoading, isError, error } = useGetInvoices(searchParamStr);
  const updateMutation = useUpdateInvoice(id);
  const deleteMutation = useDeleteInvoice(id, () => setIsDeleteOpen(false));

  useEffect(() => {
    if (!searchParamStr) {
      const params = new URLSearchParams();
      params.set("page", 1);
      params.set("limit", 10);
      router.replace(`?${params.toString()}`);
    }
  }, [searchParamStr, router]);

  if (isLoading) return <DataTableSkeleton columnCount={5} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input space-y-2 rounded-lg">
      <DataTable
        columns={columns(openModal, setId, user, updateMutation)}
        data={data?.invoices ?? []}
        totalItems={data?.total ?? 0}
      />

      <DeleteDialog
        {...{
          isOpen: isDeleteOpen,
          setIsOpen: setIsDeleteOpen,
          mutation: deleteMutation,
        }}
      />
    </div>
  );
}
