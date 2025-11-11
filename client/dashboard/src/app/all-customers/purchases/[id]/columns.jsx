"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

export const columns = (user) =>
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
      accessorKey: "chassis_no",
      header: "CHASSIS NO.",
      cell: ({ row }) => {
        const chassis = row.getValue("chassis_no");
        return (
          <Badge className="uppercase" variant={"outline"}>
            {chassis}
          </Badge>
        );
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
      accessorKey: "color",
      header: "COLOR",
      cell: ({ row }) => {
        const color = row.getValue("color");
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
  ].filter(Boolean);
