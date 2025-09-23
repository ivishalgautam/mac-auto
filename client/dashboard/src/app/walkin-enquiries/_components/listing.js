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
  useDeleteWalkInEnquiryMutation,
  useGetWalkInEnquiries,
  useUpdateWalkInEnquiryMutation,
} from "@/mutations/walkin-enquiries-mutation";

import { saveAs } from "file-saver";
import Papa from "papaparse";
import { flattenEnquiry } from "@/helpers/flatten-walking-enquiry";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ConvertDialog } from "./dialog/convert-dialog";
import { WalkInEnquiryAssignDialog } from "./dialog/inquiry-assign-dialog";

export default function Listing() {
  const { user } = useAuth();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isConvertModal, setIsConvertModal] = useState(false);
  const [isInquiryAssignModal, setIsInquiryAssignModal] = useState(false);
  const [isQuotationModal, setIsQuotationModal] = useState(false);
  const [id, setId] = useState(null);
  const [selectedEnq, setSelectedEnq] = useState({});

  const searchParams = useSearchParams();
  const searchParamStr = searchParams.toString();
  const router = useRouter();
  const pathname = usePathname();

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

  function downloadCSV() {
    const csvData = data.enquiries.map(flattenEnquiry);
    const csvString = Papa.unparse(csvData);

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `walkin-enquiries-page-${searchParams.get("page") ?? 1}.csv`);
  }

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
      {/* <div className="text-end">
        <Button type="button" onClick={downloadCSV} variant="outline">
          <Download size={15} className="mr-1" />
          Export CSV
        </Button>
      </div> */}

      <div className="mb-4 flex w-max gap-2 rounded-full border p-1 text-sm">
        <Link
          href={"/walkin-enquiries?page=1&limit=10"}
          className={cn("rounded-full p-4 py-1", {
            "bg-primary": pathname === "/walkin-enquiries",
          })}
        >
          Walk In Enquiries
        </Link>
        <Link
          href={"/enquiries?page=1&limit=10"}
          className={cn("rounded-full p-4 py-1", {
            "bg-primary": pathname === "/enquiries",
          })}
        >
          Mac Auto Enquiries
        </Link>
      </div>

      <DataTable
        columns={columns(
          openModal,
          setId,
          user,
          updateMutation,
          setSelectedEnq,
        )}
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

      <ConvertDialog
        {...{
          isOpen: isConvertModal,
          setIsOpen: setIsConvertModal,
          inquiryId: id,
          selectedEnq: selectedEnq,
        }}
      />

      <WalkInEnquiryAssignDialog
        {...{
          isOpen: isInquiryAssignModal,
          setIsOpen: setIsInquiryAssignModal,
          inquiryId: id,
        }}
      />
    </div>
  );
}
