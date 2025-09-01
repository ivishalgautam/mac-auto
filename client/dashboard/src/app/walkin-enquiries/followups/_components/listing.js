"use client";
import { columns } from "../columns";
import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/table/data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { deleteEnquiry } from "@/services/enquiry";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  useDeleteFollowupMutation,
  useGetFollowups,
} from "@/mutations/followup-mutation";
import { DeleteDialog } from "./delete-dialog";
import { CreateFollowupDialog } from "../../_components/dialog/create-followup-dialog";

export default function Listing({}) {
  const { user } = useAuth();

  const searchParams = useSearchParams();
  const searchParamStr = searchParams.toString();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [id, setId] = useState(null);
  const [enquiryId, setEnquiryId] = useState(searchParams.get("enquiry"));
  const [type, setType] = useState("");

  const router = useRouter();

  function openModal(type) {
    if (!type) return toast.warning("Please provide which modal should open!");
    if (type === "delete") {
      setIsDeleteOpen(true);
    }
    if (type === "create") {
      setType("create");
      setIsCreateOpen(true);
    }
    if (type === "edit") {
      setType("edit");
      setIsCreateOpen(true);
    }
  }

  const { data, isLoading, isError, error } = useGetFollowups(searchParamStr);

  const deleteMutation = useDeleteFollowupMutation(id, () =>
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
  if (isError) error?.message ?? "error";

  return (
    <div className="border-input rounded-lg">
      <div className="mb-2 text-end">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            openModal("create");
          }}
        >
          <Plus /> Create
        </Button>
      </div>

      <DataTable
        columns={columns(openModal, setId, user)}
        data={data?.followups ?? []}
        totalItems={data.total}
      />

      <DeleteDialog
        {...{
          isOpen: isDeleteOpen,
          setIsOpen: setIsDeleteOpen,
          mutation: deleteMutation,
        }}
      />

      <CreateFollowupDialog
        {...{
          isOpen: isCreateOpen,
          setIsOpen: setIsCreateOpen,
          enquiryId: enquiryId,
          type: type,
          id,
        }}
      />
    </div>
  );
}
