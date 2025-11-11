"use client";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { columns } from "../columns";
import { DeleteDialog } from "./delete-dialog";
import ErrorMessage from "@/components/ui/error";
import {
  useDeleteOrder,
  useOrders,
  useUpdateOrder,
} from "@/mutations/use-orders";
import { useAuth } from "@/providers/auth-provider";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import http from "@/utils/http";
import { endpoints } from "@/utils/endpoints";

export default function Listing() {
  const { user } = useAuth();
  const [id, setId] = useState(null);
  const [isModal, setIsModal] = useState(false);
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const { data, isLoading, isError, error } = useOrders(searchParamsStr);
  const deleteMutation = useDeleteOrder(id, () => {
    setIsModal(false);
  });
  const updateMutation = useUpdateOrder(id, () => {});

  async function downloadCSV() {
    if (!data.orders.length) return toast.warning("No data found");
    const { data: ordersData } = await http().get(endpoints.orders.getAll);
    const csvData = ordersData.orders ?? [];

    const csvString = Papa.unparse(csvData);

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `orders.csv`);
  }

  if (isLoading) return <DataTableSkeleton columnCount={4} rowCount={10} />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input w-full rounded-lg">
      <div className="mb-2 space-x-2 text-end">
        <Button type="button" onClick={downloadCSV} variant="outline">
          <Download size={15} className="mr-1" />
          Export CSV
        </Button>
      </div>

      <DataTable
        columns={columns(setId, updateMutation, user, () => setIsModal(true))}
        data={data?.orders ?? []}
        totalItems={data?.total ?? 0}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
        id={id}
      />
    </div>
  );
}
