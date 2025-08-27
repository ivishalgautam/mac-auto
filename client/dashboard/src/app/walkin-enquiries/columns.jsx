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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { walkinEnquiriesStatus } from "@/data";

export const columns = (openModal, setId, user, updateMutation) =>
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
    },
    {
      accessorKey: "location",
      header: "Location",
    },
    {
      accessorKey: "vehicle_name",
      header: "Model name",
    },
    {
      accessorKey: "status",
      header: ({ column }) => {
        return <Button variant="ghost">Finance status</Button>;
      },
      cell: ({ row }) => {
        const status = row.getValue("status");
        const purchaseType = row.getValue("purchase_type");
        const id = row.original.id;

        return purchaseType === "finance" ? (
          <Select
            value={status}
            onValueChange={(value) => {
              setId(id);
              const formData = new FormData();
              formData.append("status", value);
              updateMutation.mutate(formData);
            }}
          >
            <SelectTrigger className={"capitalize"}>
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {walkinEnquiriesStatus.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className={"capitalize"}
                  disabled={["approved", "rejected"].includes(status)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          "N/a"
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
