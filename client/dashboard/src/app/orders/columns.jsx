"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import moment from "moment";
import Link from "next/link";
import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLES } from "@/data/routes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

export const orderStatuses = [
  { value: "pending", label: "Pending", color: "bg-amber-500" },
  { value: "in process", label: "In Process", color: "bg-blue-500" },
  { value: "dispatched", label: "Dispatched", color: "bg-violet-500" },
  {
    value: "out for delivery",
    label: "Out For Delivery",
    color: "bg-indigo-500",
  },
  { value: "delivered", label: "Delivered", color: "bg-green-500" },
];

export const columns = (setId, updateMutation, user, openModal) =>
  [
    {
      accessorKey: "order_code",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Order No. <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const status = row.getValue("status");

        return (
          <Badge
            className={orderStatuses.find((s) => s.value === status).color}
          >
            <Link href={`/orders/${row.original.id}/items`}>
              {row.getValue("order_code")}
            </Link>
          </Badge>
        );
      },
    },
    user.role === "admin" && {
      accessorKey: "dealership_name",
      header: "Dealership",
      cell: ({ row }) => {
        const dealer = row.getValue("dealership_name");
        return <div className="capitalize">{dealer}</div>;
      },
    },

    // {
    //   accessorKey: "email",
    //   header: "Email",
    // },
    // {
    //   accessorKey: "mobile_number",
    //   header: "Phone",
    // },
    user?.role === "dealer" && {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        return <div className="capitalize">{row.getValue("status")}</div>;
      },
    },
    user?.role === "admin" && {
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
              if (value === "out for delivery") {
                return openModal("delivery-details");
              }
              setTimeout(() => {
                const formData = new FormData();
                formData.append("status", value);

                updateMutation.mutate(formData);
              }, 0);
            }}
          >
            <SelectTrigger className={"capitalize"}>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((option) => {
                const statusOrder = orderStatuses.map((o) => o.value);
                const currentIndex = statusOrder.indexOf(status);
                const optionIndex = statusOrder.indexOf(option.value);

                const disabled = optionIndex < currentIndex;

                return (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className={`flex items-center gap-2 capitalize`}
                    disabled={disabled}
                  >
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${option.color}`}
                    />
                    {option.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      accessorKey: "message",
      header: ({ column }) => {
        return <Button variant="ghost">Message</Button>;
      },
      cell: ({ row }) => {
        const message = row.getValue("message");

        return (
          <div className="line-clamp-2 max-w-96 text-wrap">
            {message && message !== "" ? message : "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created On <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
        );
      },
    },
    user?.role === "admin" && {
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
                <Link href={`/orders/${id}/edit`} className="w-full">
                  Edit
                </Link>
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
