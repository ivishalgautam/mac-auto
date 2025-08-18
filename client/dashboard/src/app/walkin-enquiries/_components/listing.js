"use client";
import { columns } from "../columns";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/table/data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import {
  deleteEnquiry,
  deleteWalkinEnquiry,
  fetchWalkinEnquiries,
} from "@/services/enquiry";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import ErrorMessage from "@/components/ui/error";
import { DeleteDialog } from "./delete-dialog";
import {
  useDeleteWalkInEnquiryMutation,
  useGetWalkInEnquiries,
  useUpdateWalkInEnquiryMutation,
} from "@/mutations/walkin-enquiries-mutation";

export default function Listing() {
  const { user } = useAuth();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConvertModal, setIsConvertModal] = useState(false);
  const [isInquiryAssignModal, setIsInquiryAssignModal] = useState(false);
  const [id, setId] = useState(null);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const searchParamStr = searchParams.toString();
  const router = useRouter();

  function openModal(type) {
    if (!type) return toast.warning("Please provide which modal should open!");
    if (type === "delete") {
      setIsDeleteOpen(true);
    }
    if (type === "convert") {
      setIsConvertModal(true);
    }
    if (type === "inquiry-assign") {
      setIsInquiryAssignModal(true);
    }
  }

  const { data, isLoading, isError, error } =
    useGetWalkInEnquiries(searchParamStr);
  const updateMutation = useUpdateWalkInEnquiryMutation(id);
  const deleteMutation = useDeleteWalkInEnquiryMutation(id, () =>
    setIsDeleteOpen(false),
  );

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
    <div className="border-input rounded-lg">
      <DataTable
        columns={columns(openModal, setId, user, updateMutation)}
        data={data.enquiries}
        totalItems={data.total}
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
