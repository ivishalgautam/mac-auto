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
import { useGetDealers } from "@/mutations/dealer-mutation";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import moment from "moment";
import { Download, FileDown } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";
import Link from "next/link";

export default function Listing() {
  const [isDeleteModal, setIsDeleteModal] = useState(false);
  const [isAssignDealerModal, setIsAssignDealerModal] = useState(false);
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

  const { data, isLoading, isError, error } = useGetDealers(searchParamsStr);
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

  async function downloadCSV() {
    const { data } = await http().get(endpoints.dealers.getAll);
    const csvData = data.dealers.map((d) => ({
      fullname: d.fullname,
      username: d.username,
      phone: d.mobile_number,
      email: d.email,
      regsitered: moment(d.created_at).format("DD/MM/YYYY"),
    }));
    const csvString = Papa.unparse(csvData);

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `users.csv`);
  }

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input w-full rounded-lg">
      <div className="mb-2 space-x-2 text-end">
        <Button type="button" onClick={downloadCSV} variant="outline">
          <Download size={15} className="mr-1" />
          Export CSV
        </Button>
        <Link href="/dealers/import" className={buttonVariants({ size: "sm" })}>
          <FileDown size="15" /> Import Dealers
        </Link>
      </div>

      <DataTable
        columns={columns(updateMutation, setUserId, openModal)}
        data={data?.dealers ?? []}
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
