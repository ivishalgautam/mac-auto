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

export const columns = (openModal, setId, user) =>
  [
    {
      accessorKey: "vehicle_name",
      header: "VEHICLE NAME",
    },
    {
      accessorKey: "name",
      header: "NAME",
    },
    {
      accessorKey: "phone",
      header: "PHONE",
    },
    {
      accessorKey: "location",
      header: "LOCATION",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return (
          <Badge className={"capitalize"} variant={"outline"}>
            {row.getValue("status")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "purchase_type",
      header: "Purchase type",
      cell: ({ row }) => {
        return (
          <Badge className={"capitalize"} variant={"outline"}>
            {row.getValue("purchase_type")}
          </Badge>
        );
      },
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
              <DropdownMenuItem>
                <Link href={`/walkin-enquiries/${id}/view`}>View</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href={`/walkin-enquiries/${id}/edit`}>Edit</Link>
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
  ].filter(Boolean);
