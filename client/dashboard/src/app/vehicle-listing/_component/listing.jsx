"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import { useGetVehicles } from "@/mutations/vehicle-mutation";
import { RaiseEnquiryDialog } from "./raise-enquiry-dialog";
import { useCreateDealerOrder } from "@/mutations/dealer-order-mutation";

export default function Listing() {
  const [isModal, setIsModal] = useState(false);
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = () => setIsModal(true);
  const closeModal = () => setIsModal(false);

  const { data, isLoading, isError, error } = useGetVehicles(searchParamsStr);
  const createDealerOrderMutation = useCreateDealerOrder(() =>
    setIsDealerOrderModal(false),
  );
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
        columns={columns(setId, openModal)}
        data={data?.vehicles ?? []}
        totalItems={data?.total}
      />
      <RaiseEnquiryDialog
        isOpen={isModal}
        setIsOpen={setIsModal}
        vehicleId={id}
        callback={closeModal}
      />
    </div>
  );
}
