"use client";
import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import {
  useDeleteTicket,
  useGetTickets,
  useUpdateTicket,
} from "@/mutations/ticket-mutation";
import { DeleteDialog } from "./delete-dialog";
import { ViewPicturesDialog } from "./view-pictures-dialog";
import { useAuth } from "@/providers/auth-provider";

export default function Listing() {
  const { user } = useAuth();
  const [isModal, setIsModal] = useState(false);
  const [isViewPicturesModal, setIsViewPicturesModal] = useState(false);
  const [pictures, setPictures] = useState([]);
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();
  const openModal = () => setIsModal(true);
  const closeModal = () => setIsModal(false);

  const { data, isLoading, isError, error } = useGetTickets(searchParamsStr);
  const deleteMutation = useDeleteTicket(id, closeModal);
  const updateMutation = useUpdateTicket(id);
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
        columns={columns(
          updateMutation,
          setId,
          openModal,
          setIsViewPicturesModal,
          setPictures,
          user,
        )}
        data={data?.tickets ?? []}
        totalItems={data?.total}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
      />

      <ViewPicturesDialog
        isOpen={isViewPicturesModal}
        setIsOpen={setIsViewPicturesModal}
        pictures={pictures ?? []}
      />
    </div>
  );
}
