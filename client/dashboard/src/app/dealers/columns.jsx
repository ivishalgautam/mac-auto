"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Muted, Small } from "@/components/ui/typography";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import moment from "moment";
import Link from "next/link";

export const columns = (updateMutation, setUserId, openModal) => [
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
    accessorKey: "username",
    header: "USERNAME",
    cell: ({ row }) => {
      const username = row.getValue("username");
      return (
        <div className="flex items-center justify-start gap-2">
          <Badge variant={"outline"}>@{username}</Badge>
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
    accessorKey: "is_active",
    header: ({ column }) => {
      return <Button variant="ghost">STATUS</Button>;
    },
    cell: ({ row }) => {
      const is_active = row.getValue("is_active");
      const id = row.original.user_id;
      return (
        <div className="flex items-center justify-start gap-2">
          <Switch
            checked={is_active}
            onCheckedChange={(checked) => {
              setUserId(id);
              return updateMutation.mutate({ is_active: checked });
            }}
          />
          <Small className={is_active ? "text-green-500" : "text-red-500"}>
            {is_active ? "active" : "inactive"}
          </Small>
        </div>
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
      const id = row.original.user_id;
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
              <Link href={`/dealers/${id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setUserId(id);
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
];
