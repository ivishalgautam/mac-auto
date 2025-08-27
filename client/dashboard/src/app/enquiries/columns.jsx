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
      accessorKey: "enquiry_code",
      header: "Enquiry ID",
      cell: ({ row }) => {
        return <Badge>{row.getValue("enquiry_code")}</Badge>;
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return <Button variant="ghost">Date</Button>;
      },
      cell: ({ row }) => {
        return (
          <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Customer name",
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => {
        const phone = row.getValue("phone");
        return phone ? phone : "N/a";
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const location = row.getValue("location");
        return location ? location : "N/a";
      },
    },
    {
      accessorKey: "vehicle_name",
      header: "Model name",
    },
    {
      accessorKey: "quantity",
      header: "Quantity",
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.getValue("message");
        return message ? message : "N/a";
      },
    },
    user.role === "admin" && {
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
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => {
        const email = row.getValue("email");
        return email ? email : "N/a";
      },
    },
    user.role === "admin" && {
      accessorKey: "dealership",
      header: "Dealership",
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
                <Link
                  href={`/enquiries/followups?page=1&limit=10&enquiry=${id}`}
                >
                  Follow ups
                </Link>
              </DropdownMenuItem>
              {user?.role === "dealer" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setId(id);
                      openModal("convert");
                    }}
                  >
                    Convert to customer
                  </DropdownMenuItem>
                </>
              )}
              {user?.role === "admin" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setId(id);
                      openModal("inquiry-assign");
                    }}
                  >
                    Assign to dealer
                  </DropdownMenuItem>
                </>
              )}
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
