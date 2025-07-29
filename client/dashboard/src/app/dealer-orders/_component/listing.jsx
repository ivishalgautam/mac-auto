"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import {
  useDeleteDealerOrder,
  useGetDealerOrders,
  useUpdateDealerOrder,
} from "@/mutations/dealer-order-mutation";
import { useAuth } from "@/providers/auth-provider";
import { DeleteDialog } from "./dialog/delete-dialog";

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
    useGetDealerOrders(searchParamsStr);
  const updateMutation = useUpdateDealerOrder(id);
  const deleteMutation = useDeleteDealerOrder(id, closeModal);

  const handleNavigate = (link) => router.push(link);

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
        columns={columns(
          setId,
          updateMutation,
          user,
          handleNavigate,
          setIsModal,
        )}
        data={data?.orders ?? []}
        totalItems={data?.total}
      />
      <DeleteDialog
        isOpen={isModal}
        setIsOpen={setIsModal}
        deleteMutation={deleteMutation}
      />
    </div>
  );
}
