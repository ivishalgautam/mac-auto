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
import { Badge } from "@/components/ui/badge";

export const columns = (setId, openModal) => [
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
  {
    header: "Action",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Button
          size={"sm"}
          variant={"outline"}
          type="button"
          onClick={() => {
            setId(id);
            openModal();
          }}
        >
          Raise enquiry
        </Button>
      );
    },
  },
];
