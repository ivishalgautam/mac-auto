"use client";

import ErrorMessage from "@/components/ui/error";
import { DataTable } from "@/components/ui/table/data-table";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { columns } from "../columns";
import {
  useGetDealerInventory,
  useUpdateDealerInventoryItem,
} from "@/mutations/dealer-inventory.mutation";
import { CustomerOrderCreateDialog } from "./order-create-dialog";
import { VehicleCard } from "./vehicle-card";
import { RaiseEnquiryDialog } from "./raise-enquiry-dialog";
import { VehicleCardSkeleton } from "./vehicle-card-skeloton";
import { VehicleNotFound } from "./vehicle-not-found";
import { H2 } from "@/components/ui/typography";

export default function Listing() {
  const [isModal, setIsModal] = useState(false);
  const [isRaiseEnqModal, setIsRaiseEnqModal] = useState(false);
  const [id, setId] = useState("");
  const searchParams = useSearchParams();
  const searchParamsStr = searchParams.toString();
  const router = useRouter();

  const openModal = (type) => {
    if (type === "create-order") {
      setIsModal(true);
    }
    if (type === "raise-enq") {
      setIsRaiseEnqModal(true);
    }
  };
  const closeModal = (type) => {
    if (type === "create-order") {
      setIsModal(false);
    }
    if (type === "raise-enq") {
      setIsRaiseEnqModal(false);
    }
  };

  const { data, isLoading, isError, error } =
    useGetDealerInventory(searchParamsStr);

  const updateMutation = useUpdateDealerInventoryItem(id);

  useEffect(() => {
    if (!searchParamsStr) {
      const params = new URLSearchParams();
      params.set("page", 1);
      router.replace(`?${params.toString()}`);
    }
  }, [searchParamsStr, router]);

  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input mt-4 w-full rounded-lg">
      {/* <DataTable
        columns={columns(setId, openModal)}
        data={data?.inventory ?? []}
        totalItems={data?.total}
      /> */}
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          Array.from({ length: 10 }).map((_, ind) => (
            <VehicleCardSkeleton key={ind} />
          ))
        ) : data?.inventory?.length === 0 ? (
          <div className="col-span-full">
            <VehicleNotFound />
          </div>
        ) : (
          <div className="col-span-full space-y-8">
            {(() => {
              const groupedData = Object.groupBy(
                data?.inventory,
                ({ category }) => category,
              );

              return Object.entries(groupedData)?.map(([key, value]) => {
                return (
                  <div className="space-y-4">
                    <H2 className={"border-none"}>{key}</H2>
                    <div className="grid grid-cols-2 gap-4">
                      {value.map((inv) => {
                        return (
                          <VehicleCard
                            key={inv.id}
                            vehicle={inv}
                            onAssignToCustomer={() => {
                              setId(inv.id);
                              openModal("create-order");
                            }}
                            onOrderVehicle={() => {
                              setId(inv.id);
                              openModal("raise-enq");
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>

      <CustomerOrderCreateDialog
        isOpen={isModal}
        setIsOpen={setIsModal}
        callback={() => closeModal("create-order")}
        vehicleId={id}
        maxSelect={1}
      />

      <RaiseEnquiryDialog
        isOpen={isRaiseEnqModal}
        setIsOpen={setIsRaiseEnqModal}
        vehicleId={id}
        callback={() => closeModal("raise-enq")}
      />
    </div>
  );
}
