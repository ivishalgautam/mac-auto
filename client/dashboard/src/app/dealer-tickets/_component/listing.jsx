"use client";
import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import { DeleteDialog } from "./delete-dialog";
import { useAuth } from "@/providers/auth-provider";
import {
  useDeleteDealerTicket,
  useGetDealerTickets,
  useUpdateDealerTicket,
} from "@/mutations/dealer-ticket-mutation";
import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

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
    useGetDealerTickets(searchParamsStr);
  const deleteMutation = useDeleteDealerTicket(id, closeModal);
  const updateMutation = useUpdateDealerTicket(id);
  useEffect(() => {
    if (!searchParamsStr) {
      const params = new URLSearchParams();
      params.set("page", 1);
      params.set("limit", 10);
      router.replace(`?${params.toString()}`);
    }
  }, [searchParamsStr, router]);

  async function downloadCSV() {
    if (!data.tickets.length) return toast.warning("No data found");
    const { data: ticketsData } = await http().get(
      endpoints.dealerTickets.getAll,
    );
    const csvData = ticketsData.tickets ?? [];

    const csvString = Papa.unparse(csvData);

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `dealer-tickets.csv`);
  }

  if (isLoading) return <DataTableSkeleton columnCount={6} rowCount={10} />;
  if (isError) return <ErrorMessage error={error?.message ?? "error"} />;

  return (
    <div className="border-input w-full rounded-lg">
      <div className="mb-2 space-x-2 text-end">
        <Button type="button" onClick={downloadCSV} variant="outline">
          <Download size={15} className="mr-1" />
          Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns(updateMutation, setId, openModal, user)}
        data={data?.tickets ?? []}
        totalItems={data?.total}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
      />
    </div>
  );
}
