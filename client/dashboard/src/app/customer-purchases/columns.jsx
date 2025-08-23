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

export const columns = (setId, openModal, user) =>
  [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const title = row.getValue("title");
        return <div className="capitalize">{title}</div>;
      },
    },
    {
      accessorKey: "category",
      header: "CATEGORY",
      cell: ({ row }) => {
        const category = row.getValue("category");
        return <Badge className={"capitalize"}>{category}</Badge>;
      },
    },
    {
      accessorKey: "color_hex",
      header: "COLOR",
      cell: ({ row }) => {
        const color = row.getValue("color_hex");
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
    ["customer", "admin"].includes(user?.role) && {
      accessorKey: "dealership",
      header: "Dealership",
    },
    ["customer", "admin"].includes(user?.role) && {
      accessorKey: "dealer_phone",
      header: "Dealer Contact",
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return <Button variant="ghost">Puchased On</Button>;
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
                <Link
                  href={`/dealer-inventory/${id}/inventory?page=1&limit=10`}
                >
                  Inventory
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setId(id);
                  openModal("create-order");
                }}
              >
                Create order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ].filter(Boolean);
