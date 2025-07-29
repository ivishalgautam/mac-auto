"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import moment from "moment";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { statusOptions } from "./_component/table-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React from "react";
import { calculateBatchPdiMatchRates } from "@/lib/calculate-pdi-match-rate";

export const columns = (
  setId,
  updateMutation,
  user,
  handleNavigate,
  setIsModal,
) =>
  [
    {
      accessorKey: "vehicle_title",
      header: "TITLE",
      cell: ({ row }) => {
        const title = row.getValue("vehicle_title");
        return <div className="capitalize">{title}</div>;
      },
    },
    user.role === "admin" && {
      accessorKey: "dealer_name",
      header: "Dealer",
      cell: ({ row }) => {
        const dealer = row.getValue("dealer_name");
        return <div className="capitalize">{dealer}</div>;
      },
    },
    {
      accessorKey: "color",
      header: "COLOR",
      cell: ({ row }) => {
        const color = row.getValue("color");
        return (
          <div className="flex gap-1">
            <span
              className="size-6 rounded-full"
              style={{ backgroundColor: color }}
            ></span>
          </div>
        );
      },
    },
    {
      accessorKey: "chassis_nos",
      header: "CHASSIS",
      cell: ({ row }) => {
        const nos = row.getValue("chassis_nos");
        return (
          <div className="flex gap-1">
            {nos.map((no) => (
              <Badge key={no} variant={"outline"}>
                {no}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return <Button variant="ghost">Status</Button>;
      },
      cell: ({ row }) => {
        const status = row.getValue("status");
        const id = row.original.id;
        const pdiChecks = row.original.pdi_checks;
        const isAdminPdi = !!pdiChecks.find(
          (pdi) => pdi.pdi_by.role === "admin",
        )?.pdi?.length;

        return (
          <Select
            value={status}
            onValueChange={(value) => {
              if (["dispatch", "delivered"].includes(value))
                return handleNavigate(`/dealer-orders/${id}/pdi/add`);

              setId(id);
              updateMutation.mutate({ status: value });
            }}
          >
            <SelectTrigger className={"capitalize"}>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={"capitalize"}
                  disabled={
                    ["delivered", "canceled"].includes(status) ||
                    (user.role === "dealer" &&
                      (option.value === "dispatch" ||
                        (option.value === "delivered" && !isAdminPdi)))
                  }
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      header: "PDI Match Rate",
      cell: ({ row }) => {
        const pdiChecks = row.original.pdi_checks;
        const dealerPdi =
          pdiChecks.find((pdi) => pdi.pdi_by.role === "dealer")?.pdi ?? [];
        const adminPdi =
          pdiChecks.find((pdi) => pdi.pdi_by.role === "admin")?.pdi ?? [];

        return (
          <div className="space-x-1">
            {calculateBatchPdiMatchRates(dealerPdi, adminPdi).map(
              (result, idx) => (
                <Badge variant={"outline"} key={idx} className={"pr-0.5"}>
                  {result.chassis_no} <Badge>{result.matchRate}</Badge>
                </Badge>
              ),
            )}
          </div>
        );
      },
    },
    // {
    //   header: "PDI",
    //   cell: ({ row }) => {
    //     const nos = row.getValue("chassis_nos");
    //     const id = row.original.id;
    //     return (
    //       <div className="flex gap-1">
    //         <Link
    //           href={`/dealer-orders/${id}/pdi/add`}
    //           className={buttonVariants({ variant: "outline", size: "sm" })}
    //         >
    //           <Plus className="size-3" /> Add
    //         </Link>
    //       </div>
    //     );
    //   },
    // },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return <Button variant="ghost">Created At</Button>;
      },
      cell: ({ row }) => {
        return (
          <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.id;
        const role = row.original.role;
        const pdiChecks = row.original.pdi_checks;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {pdiChecks.map((pdi) => (
                <React.Fragment key={pdi.id}>
                  <DropdownMenuItem className="capitalize">
                    <Link href={`/dealer-orders/pdi/${pdi.id}/view`}>
                      PDI by {pdi.pdi_by.role}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </React.Fragment>
              ))}
              <DropdownMenuItem
                onClick={() => {
                  setId(id);
                  setIsModal(true);
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ].filter(Boolean);
