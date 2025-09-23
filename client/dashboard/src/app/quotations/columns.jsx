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
    accessorKey: "quotation_no",
    header: "Quotation No",
    cell: ({ row }) => {
      return <Badge>{row.getValue("quotation_no")}</Badge>;
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
    accessorKey: "model",
    header: "Model",
  },
  {
    accessorKey: "variant",
    header: "Variant",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "base_price_ex_showroom",
    header: "Ex-Showroom Price",
  },
  {
    accessorKey: "gst",
    header: "GST %",
  },
  {
    accessorKey: "insurance",
    header: "Insurance",
  },
  {
    accessorKey: "rto_registration_charges",
    header: "RTO Charges",
  },
  {
    accessorKey: "total_ex_showroom_price",
    header: "Total Price",
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => row.getValue("discount") || "N/a",
  },
  {
    accessorKey: "on_road_price",
    header: "On-Road Price",
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const id = row.original.id;
      const status = row.original.status;

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
              <Link href={`/quotations/${id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal("convert-to-invoice");
              }}
              disabled={status === "invoice-generated"}
            >
              {status === "invoice-generated"
                ? "Invoice generated"
                : "Convert to Invoice"}
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
