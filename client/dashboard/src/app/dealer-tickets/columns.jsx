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

export const columns = (updateMutation, setId, openModal, user) =>
  [
    {
      accessorKey: "ticket_number",
      header: "Ticket",
      cell: ({ row }) => {
        const ticketNumber = row.getValue("ticket_number");
        return <Badge className="capitalize">{ticketNumber}</Badge>;
      },
    },
    user.role === "admin" && {
      accessorKey: "dealership_name",
      header: "Dealership",
      cell: ({ row }) => {
        const ticketNumber = row.getValue("dealership_name");
        return <div className="capitalize">{ticketNumber}</div>;
      },
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.getValue("message");
        return (
          <div className="capitalize">
            {message.length > 50 ? message.substring(0, 50) + "..." : message}
          </div>
        );
      },
    },
    ["admin"].includes(user?.role) && {
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
    user?.role === "dealer" && {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status");
        const className =
          ticketStatus.find((s) => s.value === status)?.className ?? "";
        return <Badge className={cn("capitalize", className)}>{status}</Badge>;
      },
    },
    { accessorKey: "complaint_type", header: "Complaint type" },
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
                <Link href={`/dealer-tickets/${id}/view`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/dealer-tickets/${id}/edit`}>Edit</Link>
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
