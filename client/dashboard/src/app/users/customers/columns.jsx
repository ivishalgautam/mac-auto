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

export const columns = (setCustomerId, openModal) => [
  {
    accessorKey: "fullname",
    header: "FULLNAME",
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
    header: "PHONE",
  },
  {
    accessorKey: "email",
    header: "EMAIL",
  },
  {
    accessorKey: "total_purchases",
    header: "Total Purchases",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link href={`/users/customers/purchases/${id}?page=1&limit=10`}>
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
      return <Button variant="ghost">REGISTERED ON</Button>;
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
      const userId = row.original.user_id;
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
              <Link href={`/users/${userId}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setCustomerId(id);
                openModal("assign-dealer");
              }}
            >
              Assign to dealer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
