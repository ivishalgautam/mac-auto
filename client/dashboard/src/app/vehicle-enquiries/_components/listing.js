"use client";
import { columns } from "../columns";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/table/data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { DeleteDialog } from "./dialog/delete-dialog";
import {
  useDeleteVehicleEnquiry,
  useFetchVehicleEnquiries,
} from "@/mutations/vehicle-enquiry-mutation";
import { DealerOrderCreateDialog } from "@/app/vehicles/_component/order-create-dialog";
import { useCreateDealerOrder } from "@/mutations/dealer-order-mutation";
import ErrorMessage from "@/components/ui/error";
import { UpdateDialog } from "./dialog/update-dialog";

export default function Listing() {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDealerOrderModal, setIsDealerOrderModal] = useState(false);
  const [maxSelect, setMaxSelect] = useState(null);
  const [id, setId] = useState(null);
  const [vehicleId, setVehicleId] = useState(null);
  const [vehicleColorId, setVehicleColorId] = useState(null);
  const [vehicleVariantMapId, setVehicleVariantMapId] = useState(null);
  const [dealerId, setDealerId] = useState(null);
  const searchParams = useSearchParams();
  const searchParamStr = searchParams.toString();
  const router = useRouter();

  function openModal(type) {
    if (!type) return toast.warning("Please provide which modal should open!");
    if (type === "delete") {
      setIsDeleteOpen(true);
    } else if (type === "update") {
      setIsUpdateOpen(true);
    } else if ("dealer-order") {
      setIsDealerOrderModal(true);
    }
  }

  const { data, isLoading, isError, error } =
    useFetchVehicleEnquiries(searchParamStr);
  const deleteMutation = useDeleteVehicleEnquiry(id, () =>
    setIsDeleteOpen(false),
  );
  const createDealerOrderMutation = useCreateDealerOrder(() =>
    setIsDealerOrderModal(false),
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
        columns={columns(
          openModal,
          setId,
          setVehicleId,
          setVehicleColorId,
          setVehicleVariantMapId,
          setDealerId,
          setMaxSelect,
        )}
        data={data.enquiries}
        totalItems={data.total}
      />

      <DealerOrderCreateDialog
        createMutation={createDealerOrderMutation}
        isOpen={isDealerOrderModal}
        setIsOpen={setIsDealerOrderModal}
        vehicleId={vehicleId}
        dealerId={dealerId}
        maxSelect={maxSelect}
        vehicleColorId={vehicleColorId}
        vehicleVariantMapId={vehicleVariantMapId}
        enquiryId={id}
      />

      <DeleteDialog
        {...{
          isOpen: isDeleteOpen,
          setIsOpen: setIsDeleteOpen,
          deleteMutation: deleteMutation,
        }}
      />

      <UpdateDialog
        {...{
          isOpen: isUpdateOpen,
          setIsOpen: setIsUpdateOpen,
          id: id,
          callback: () => setIsUpdateOpen(false),
        }}
      />
    </div>
  );
}
