"use client";
import { columns } from "../columns";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/table/data-table";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { DeleteDialog } from "../followups/_components/delete-dialog";
import { deleteEnquiry, fetchEnquiries } from "@/services/enquiry";
import { CreateDialog } from "./dialog/create-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ConvertDialog } from "./dialog/convert-dialog";
import { InquiryAssignDialog } from "./dialog/inquiry-assign-dialog";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Listing() {
  const pathname = usePathname();
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
  console.log({ user });
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

  const { data, isLoading, isError, error } = useQuery({
    queryFn: () => fetchEnquiries(searchParamStr),
    queryKey: ["enquiries", searchParamStr],
    enabled: !!searchParamStr,
  });

  console.log({ data });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEnquiry(id),
    onSuccess: () => {
      toast.success("Enquiry deleted.");
      queryClient.invalidateQueries(["enquiries", searchParamStr]);
      setIsDeleteOpen(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });

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
      {user?.role === "admin" && (
        <div className="mb-2 text-end">
          <Button type="button" size="sm" onClick={() => setIsCreateOpen(true)}>
            <Plus /> Create
          </Button>
        </div>
      )}

      <div className="mb-4 flex w-max gap-2 rounded-full border p-1 text-sm">
        <Link
          href={"/enquiries?page=1&limit=10"}
          className={cn("rounded-full p-4 py-1", {
            "bg-primary": pathname === "/enquiries",
          })}
        >
          Mac Auto Enquiries
        </Link>
        <Link
          href={"/walkin-enquiries?page=1&limit=10"}
          className={cn("rounded-full p-4 py-1", {
            "bg-primary": pathname === "/walkin-enquiries",
          })}
        >
          Walk In Enquiries
        </Link>
      </div>

      <DataTable
        columns={columns(openModal, setId, user)}
        data={data.enquiries}
        totalItems={data.total}
      />

      <DeleteDialog
        {...{
          isOpen: isDeleteOpen,
          setIsOpen: setIsDeleteOpen,
          mutation: deleteMutation,
          id,
        }}
      />

      <CreateDialog
        {...{
          isOpen: isCreateOpen,
          setIsOpen: setIsCreateOpen,
        }}
      />

      <ConvertDialog
        {...{
          isOpen: isConvertModal,
          setIsOpen: setIsConvertModal,
          inquiryId: id,
        }}
      />

      <InquiryAssignDialog
        {...{
          isOpen: isInquiryAssignModal,
          setIsOpen: setIsInquiryAssignModal,
          inquiryId: id,
        }}
      />
    </div>
  );
}
