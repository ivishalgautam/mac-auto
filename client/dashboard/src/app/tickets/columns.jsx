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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { ticketStatus } from "./_component/table-actions";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { rupee } from "@/lib/Intl";

export const columns = (
  updateMutation,
  setId,
  openModal,
  setIsViewPicturesModal,
  setPictures,
  user,
) =>
  [
    {
      accessorKey: "ticket_number",
      header: "Ticket",
      cell: ({ row }) => {
        const id = row.original.id;

        const ticketNumber = row.getValue("ticket_number");
        return (
          <Link
            className="hover:text-primary capitalize underline"
            href={`/tickets/${id}/view`}
          >
            {ticketNumber}
          </Link>
        );
      },
    },
    {
      accessorKey: "payment_status",
      header: "Payment status",
      cell: ({ row }) => {
        const status = row.getValue("payment_status");
        return (
          <Badge className="capitalize" variant={"outline"}>
            {status === "paid" ? (
              <span className="size-2 rounded-full bg-emerald-500" />
            ) : status === "unpaid" ? (
              <span className="size-2 rounded-full bg-yellow-500" />
            ) : null}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "payment_amount",
      header: "Amount paid",
      cell: ({ row }) => {
        const amt = row.getValue("payment_amount");
        return <div className="capitalize">{rupee.format(amt)}</div>;
      },
    },
    {
      accessorKey: "customer_name",
      header: "Customer name",
      cell: ({ row }) => {
        const name = row.getValue("customer_name");
        return <div className="capitalize">{name}</div>;
      },
    },
    {
      accessorKey: "state",
      header: "State",
    },
    {
      accessorKey: "city",
      header: "City",
    },
    {
      accessorKey: "chassis_no",
      header: "Chassis no.",
    },
    {
      accessorKey: "motor_no",
      header: "Motor no.",
    },
    {
      accessorKey: "battery_no",
      header: "Battery no.",
    },
    {
      accessorKey: "controller_no",
      header: "Controller no.",
    },
    {
      accessorKey: "charger_no",
      header: "Charger no.",
    },
    {
      accessorKey: "customer_phone",
      header: "Customer phone",
      cell: ({ row }) => {
        const phone = row.getValue("customer_phone");
        return <div className="capitalize">{phone}</div>;
      },
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.getValue("message");
        return <div className="capitalize">{message}</div>;
      },
    },
    {
      accessorKey: "images",
      header: "Pictures",
      cell: ({ row }) => {
        const images = row.getValue("images");
        return (
          <Button
            variant={"outline"}
            type="button"
            size="sm"
            className="capitalize"
            onClick={() => {
              setIsViewPicturesModal(true);
              setPictures(images);
            }}
          >
            {images?.length ?? 0} Pictures
          </Button>
        );
      },
    },
    ["dealer", "admin", "cre", "manager"].includes(user?.role) && {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const id = row.original.id;

        return (
          <Select
            value={status}
            onValueChange={(value) => {
              setId(id);
              updateMutation.mutate({ status: value });
            }}
          >
            <SelectTrigger className={"capitalize"}>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {ticketStatus.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={"capitalize"}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    user?.role === "customer" && {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const className =
          ticketStatus.find((s) => s.value === status)?.className ?? "";
        return <Badge className={cn("capitalize", className)}>{status}</Badge>;
      },
    },
    {
      accessorKey: "complaint_type",
      header: "Complaint type",
      cell: ({ row }) => {
        const isSparePartsComplaint =
          row.getValue("complaint_type") === "Spare Parts Related";

        return (
          <div>
            {row.getValue("complaint_type")}
            {isSparePartsComplaint && (
              <div className="flew-wrap flex gap-1">
                {row.original.parts.map((p, ind) => (
                  <Badge key={ind} variant={"outline"}>
                    {p.part_name ?? p.text}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "warranty_detail",
      header: "Warranty detail",
    },
    {
      accessorKey: "created_at",
      header: "Complaint date",
      cell: ({ row }) => {
        return (
          <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
        );
      },
    },
    {
      accessorKey: "expected_closure_date",
      header: "Expected closure date",
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("expected_closure_date")
              ? moment(row.getValue("expected_closure_date")).format(
                  "DD/MM/YYYY",
                )
              : "N/a"}
          </div>
        );
      },
    },
    {
      accessorKey: "assigned_technician",
      header: "Technician name",
      cell: ({ row }) => {
        return (
          <div>
            {row.getValue("assigned_technician") ? (
              <Badge variant={"outline"}>
                {row.getValue("assigned_technician")}
              </Badge>
            ) : (
              <Badge variant={"destructive"}>Not assigned</Badge>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.id;
        const role = row.original.role;
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
                <Link href={`/tickets/${id}/updates`}>Ticket updates</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/tickets/${id}/view`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/tickets/${id}/edit`}>Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setId(id);
                  openModal();
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
