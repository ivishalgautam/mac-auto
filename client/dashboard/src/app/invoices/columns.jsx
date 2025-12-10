"use client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import { DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const columns = (openModal, setId, user, updateMutation) => [
  {
    accessorKey: "invoice_no",
    header: "Invoice No",
    cell: ({ row }) => {
      return <Badge>{row.getValue("invoice_no")}</Badge>;
    },
  },
  {
    accessorKey: "created_at",
    header: () => <Button variant="ghost">Date</Button>,
    cell: ({ row }) => (
      <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
    ),
  },
  {
    accessorKey: "customer_name",
    header: "Customer Name",
  },
  {
    accessorKey: "mobile_no",
    header: "Phone",
  },
  {
    accessorKey: "vehicles",
    header: "Models",
    cell: ({ row }) => {
      const vehicles = row.getValue("vehicles");
      return vehicles && vehicles.length ? vehicles.join(", ") : "-";
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;
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
            <DropdownMenuItem>
              <Link href={`/invoices/${id}/edit`}>Edit</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal("delete");
              }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
