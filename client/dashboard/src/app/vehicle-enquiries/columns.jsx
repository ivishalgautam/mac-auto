"use client";
import { Button } from "../../components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import { rupee } from "@/lib/Intl";

export const columns = (
  openModal,
  setId,
  setVehicleId,
  setDealerId,
  setMaxSelect,
) => [
  {
    accessorKey: "title",
    header: "VEHICLE",
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
    accessorKey: "quantity",
    header: "QUANTITY",
  },
  {
    accessorKey: "dealership_name",
    header: "Dealership",
  },
  {
    accessorKey: "message",
    header: "MESSAGE",
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return <Button variant="ghost">DATE</Button>;
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
      const vehicleId = row.original.vehicle_id;
      const dealerId = row.original.dealer_id;
      const quantity = row.original.quantity;

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
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal("delete");
              }}
            >
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setVehicleId(vehicleId);
                setDealerId(dealerId);
                setMaxSelect(quantity);
                openModal("dealer-order");
              }}
            >
              Create order
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
