import moment from "moment";
import { ArrowUpDown, Eye, Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
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
import { Small } from "@/components/ui/typography";

// optional: define your color palette mapping
const colorMap = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  black: "bg-black",
  white: "bg-white border border-gray-300",
  silver: "bg-gray-300",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  orange: "bg-orange-500",
  brown: "bg-amber-700",
  grey: "bg-gray-400",
};

export const columns = (user, orderData) =>
  [
    {
      accessorKey: "title",
      header: "Vehicle",
    },
    {
      accessorKey: "battery_type",
      header: "Battery type",
    },
    {
      accessorKey: "colors",
      header: "Colors",
      cell: ({ row }) => {
        const colors = row.getValue("colors") || [];

        if (!Array.isArray(colors) || colors.length === 0) return <div>-</div>;

        return (
          <div className="flex flex-wrap gap-1">
            {colors.map((c, i) => {
              const colorName = (c.color || "").toLowerCase().trim();
              const colorClass = colorMap[colorName] || "bg-gray-200";

              return (
                <div
                  key={i}
                  className="flex items-center gap-1 rounded-full border p-1 px-1.5"
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full ${colorClass}`}
                    title={colorName}
                  />
                  <span className="capitalize">{c.color}</span>
                  <Badge variant="secondary" className="ml-auto">
                    <X className="size-2" />
                    {c.quantity}
                  </Badge>
                </div>
              );
            })}
          </div>
        );
      },
    },
    [ROLES.ADMIN, ROLES.CRE, ROLES.MANAGER].includes(user?.role) && {
      accessorKey: "status",
      header: "Action",
      cell: ({ row }) => {
        const id = row.original.id;
        const status = row.getValue("status");

        return orderData?.status === "cancel" ? (
          <Badge variant={"destructive"}>Order canceled</Badge>
        ) : status === "updated" ? (
          <Link
            href={`items/view-details?itemId=${id}`}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            <Eye size={15} /> View details
          </Link>
        ) : (
          <Link
            href={`items/add-details?itemId=${id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Plus size={15} /> Add details
          </Link>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created on <ArrowUpDown />
        </Button>
      ),
      cell: ({ row }) => (
        <div>{moment(row.getValue("created_at")).format("DD/MM/YYYY")}</div>
      ),
    },
    orderData?.status !== "cancel" &&
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
                  <Link
                    href={`items/edit-details?itemId=${id}`}
                    className="w-full"
                  >
                    Edit
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
  ].filter(Boolean);
