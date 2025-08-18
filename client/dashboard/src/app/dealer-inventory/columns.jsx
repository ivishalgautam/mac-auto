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

export const columns = (setId, openModal, updateMutation) => [
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
    accessorKey: "colors",
    header: "COLOR",
    cell: ({ row }) => {
      const colors = row.getValue("colors");
      return (
        <div className="flex gap-1">
          {colors.map((c) => (
            <span
              key={c.id}
              className="size-6 rounded-full"
              style={{ backgroundColor: c.color_hex }}
            ></span>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "active_quantity",
    header: "Active Qty.",
    cell: ({ row }) => {
      const id = row.original.id;
      const quantity = row.getValue("active_quantity");
      return (
        <Badge>
          <Link
            href={`/dealer-inventory/${id}/inventory?page=1&limit=10&status=active`}
          >
            {quantity}
          </Link>
        </Badge>
      );
    },
  },
  {
    accessorKey: "sold_quantity",
    header: "Sold Qty.",
    cell: ({ row }) => {
      const id = row.original.id;
      const quantity = row.getValue("sold_quantity");
      return (
        <Badge variant={"outline"}>
          <Link
            href={`/dealer-inventory/${id}/inventory?page=1&limit=10&status=sold`}
          >
            {quantity}
          </Link>
        </Badge>
      );
    },
  },
  {
    accessorKey: "inactive_quantity",
    header: "Inactive Qty.",
    cell: ({ row }) => {
      const id = row.original.id;
      const quantity = row.getValue("inactive_quantity");
      return (
        <Badge variant={"secondary"}>
          <Link
            href={`/dealer-inventory/${id}/inventory?page=1&limit=10&status=inactive`}
          >
            {quantity}
          </Link>
        </Badge>
      );
    },
  },
  {
    accessorKey: "scrapped_quantity",
    header: "Scrapped Qty.",
    cell: ({ row }) => {
      const id = row.original.id;
      const quantity = row.getValue("scrapped_quantity");
      return (
        <Badge variant={"destructive"}>
          <Link
            href={`/dealer-inventory/${id}/inventory?page=1&limit=10&status=scrapped`}
          >
            {quantity}
          </Link>
        </Badge>
      );
    },
  },
  // {
  //   accessorKey: "is_active",
  //   header: ({ column }) => {
  //     return <Button variant="ghost">STATUS</Button>;
  //   },
  //   cell: ({ row }) => {
  //     const is_active = row.getValue("is_active");
  //     const id = row.original.id;
  //     return (
  //       <div className="flex items-center justify-start gap-2">
  //         <Switch
  //           checked={is_active}
  //           onCheckedChange={(checked) => {
  //             setId(id);
  //             return updateMutation.mutate({ is_active: checked });
  //           }}
  //         />
  //         <Small className={is_active ? "text-green-500" : "text-red-500"}>
  //           {is_active ? "active" : "inactive"}
  //         </Small>
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
              <Link href={`/dealer-inventory/${id}/inventory?page=1&limit=10`}>
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
];
