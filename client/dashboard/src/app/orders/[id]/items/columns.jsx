import moment from "moment";
import { ArrowUpDown, Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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

export const columns = (openModal, setId, updateMutation) => [
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
  {
    accessorKey: "",
    header: "Action",
    cell: ({ row }) => {
      const id = row.original.id;

      return (
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
];
