"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import {
  useCreateVehicleInventory,
  useDeleteVehicle,
  useGetVehicles,
  useUpdateVehicle,
} from "@/mutations/vehicle-mutation";
import { DeleteDialog } from "./delete-dialog";
import { DealerOrderCreateDialog } from "./order-create-dialog";
import { CreateInventoryDialog } from "./create-inventory-dialog";
import { useCreateDealerOrder } from "@/mutations/dealer-order-mutation";
import UpdateVehiclePriceForm from "@/components/forms/vehicle-price";
import { UpdatePriceDialog } from "./update-price-dialog";

export default function Listing() {
  const [isModal, setIsModal] = useState(false);
  const [isInventoryModal, setIsInventoryModal] = useState(false);
  const [isDealerOrderModal, setIsDealerOrderModal] = useState(false);
  const [isUpdatePriceModal, setIsUpdatePriceModal] = useState(false);
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = (type) => {
    if (type === "vehicle") {
      setIsModal(true);
    } else if (type === "inventory") {
      setIsInventoryModal(true);
    } else if (type === "dealer-order") {
      setIsDealerOrderModal(true);
    } else if (type === "update-price") {
      setIsUpdatePriceModal(true);
    }
  };
  const closeModal = () => setIsModal(false);

  const { data, isLoading, isError, error } = useGetVehicles(searchParamsStr);
  const deleteMutation = useDeleteVehicle(id, closeModal);
  const updateMutation = useUpdateVehicle(id);
  const createInventoryMutation = useCreateVehicleInventory(id, () =>
    setIsInventoryModal(false),
  );
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
        columns={columns(updateMutation, setId, openModal)}
        data={data?.vehicles ?? []}
        totalItems={data?.total}
      />
      <DeleteDialog
        deleteMutation={deleteMutation}
        isOpen={isModal}
        setIsOpen={setIsModal}
      />
      <CreateInventoryDialog
        createMutation={createInventoryMutation}
        isOpen={isInventoryModal}
        setIsOpen={setIsInventoryModal}
      />
      <DealerOrderCreateDialog
        createMutation={createDealerOrderMutation}
        isOpen={isDealerOrderModal}
        setIsOpen={setIsDealerOrderModal}
        vehicleId={id}
      />
      <UpdatePriceDialog
        isOpen={isUpdatePriceModal}
        setIsOpen={setIsUpdatePriceModal}
        id={id}
      />
    </div>
  );
}
