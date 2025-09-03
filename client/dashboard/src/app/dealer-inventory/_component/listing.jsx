"use client";

import ErrorMessage from "@/components/ui/error";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
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
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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

  function exportInventory() {
    const csvData = data?.inventory?.map((inv) => {
      return {
        "Model Name": inv.title,
        "Active Inventory": inv.active_quantity,
        "In Active Inventory": inv.inactive_quantity,
        "Sold Inventory": inv.sold_quantity,
        "Scrapped Inventory": inv.scrapped_quantity,
      };
    });

    const csvString = Papa.unparse(csvData);

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Inventory.csv`);
  }
  function exportPrice() {
    const csvData = data?.inventory?.map((inv) => {
      return {
        "Model Name": inv.title,
        Price: inv.dealer_price,
      };
    });

    const csvString = Papa.unparse(csvData);

    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `Pricing.csv`);
  }

  useEffect(() => {
    if (!searchParamsStr) {
      const params = new URLSearchParams();
      params.set("page", 1);
      router.replace(`?${params.toString()}`);
    }
  }, [searchParamsStr, router]);

  if (isError) return <ErrorMessage error={error} />;

  return (
    <div className="border-input mt-4 w-full space-y-2 rounded-lg">
      {/* <DataTable
        columns={columns(setId, openModal)}
        data={data?.inventory ?? []}
        totalItems={data?.total}
      /> */}
      <div className="space-x-2 text-end">
        <Button type="button" variant={"outline"} onClick={exportPrice}>
          <Download /> Export Price
        </Button>
        <Button type="button" variant={"outline"} onClick={exportInventory}>
          <Download />
          Export Inventory
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
                  <div className="space-y-4" key={key}>
                    <H2 className={"border-none"}>{key}</H2>
                    <div className="grid gap-4 sm:grid-cols-2">
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
