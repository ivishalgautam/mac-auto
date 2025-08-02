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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";
import { ticketStatus } from "./_component/table-actions";

export const columns = (
  updateMutation,
  setId,
  openModal,
  setIsViewPicturesModal,
  setPictures,
) => [
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const message = row.getValue("message");
      return <div className="capitalize">{message}</div>;
    },
  },
  {
    accessorKey: "images",
    header: "Pictures",
    cell: ({ row }) => {
      const images = row.getValue("images");
      return (
        <Button
          variant={"outline"}
          type="button"
          size="sm"
          className="capitalize"
          onClick={() => {
            setIsViewPicturesModal(true);
            setPictures(images);
          }}
        >
          {images?.length ?? 0} Pictures
        </Button>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return <Button variant="ghost">Status</Button>;
    },
    cell: ({ row }) => {
      const status = row.getValue("status");
      const id = row.original.id;

      return (
        <Select
          value={status}
          onValueChange={(value) => {
            setId(id);
            updateMutation.mutate({ status: value });
          }}
        >
          <SelectTrigger className={"capitalize"}>
            <SelectValue placeholder="Select a status" />
          </SelectTrigger>
          <SelectContent>
            {ticketStatus.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={"capitalize"}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
              <Link href={`/tickets/${id}/view`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/tickets/${id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setId(id);
                openModal();
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
