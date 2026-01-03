"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Muted } from "@/components/ui/typography";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import moment from "moment";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

export const columns = (setUserId, openModal, user) => [
  {
    accessorKey: "fullname",
    header: "Fullname",
    cell: ({ row }) => {
      const fullname = row.getValue("fullname");
      const role = row.original.role;
      const location = row.original.location;
      return (
        <div className="capitalize">
          {fullname}
          {role === "dealer" && <Muted>{location}</Muted>}
        </div>
      );
    },
  },
  {
    accessorKey: "mobile_number",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "total_purchases",
    header: "Total Purchases",
    cell: ({ row }) => {
      const id = row.original.customer_id;
      return (
        <Link href={`/all-customers/purchases/${id}?page=1&limit=10`}>
          <Badge variant="outline">
            {row.getValue("total_purchases")}{" "}
            <ExternalLink className="size-3" />
          </Badge>
        </Link>
      );
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => {
      return <Button variant="ghost">Registered on</Button>;
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
      const customerId = row.original.customer_id;
      const userId = row.original.user_id;
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
              <Link href={`/customers/${customerId}/purchases`}>Purchases</Link>
            </DropdownMenuItem>
            {["admin", "cre"].includes(user?.role) && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link href={`/customers/${userId}/edit`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    setUserId(userId);
                    openModal("delete");
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
