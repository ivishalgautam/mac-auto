"use client";
import { Button } from "../../components/ui/button";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import moment from "moment";
import { ROLES } from "@/data/routes";

export const columns = (
  openModal,
  setId,
  setVehicleId,
  setVehicleColorId,
  setVehicleVariantMapId,
  setDealerId,
  setMaxSelect,
  user,
) =>
  [
    {
      accessorKey: "title",
      header: "Model name",
    },
    {
      accessorKey: "variant_name",
      header: "Variant",
    },
    {
      accessorKey: "color_hex",
      header: "Color",
      cell: ({ row }) => {
        const color = row.getValue("color_hex");
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
      accessorKey: "quantity",
      header: "Quantity",
    },
    [ROLES.ADMIN, ROLES.CRE, ROLES.MANAGER].includes(user?.role) && {
      accessorKey: "dealership_name",
      header: "Dealership",
    },
    {
      accessorKey: "message",
      header: "Message",
    },
    {
      accessorKey: "status",
      header: "status",
      cell: ({ row }) => {
        const status = row.getValue("status");

        return (
          <Button
            variant={"outline"}
            type={"button"}
            onClick={() => {
              setId(row.original.id);
              openModal("update");
            }}
            className={"capitalize"}
            disabled={status !== "pending"}
          >
            {status.split("-").join(" ")}
          </Button>
        );
      },
    },
    {
      accessorKey: "remarks",
      header: "Remarks",
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
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const id = row.original.id;
        const vehicleId = row.original.vehicle_id;
        const vehicleColorId = row.original.vehicle_color_id;
        const vehicleVariantMapId = row.original.vehicle_variant_map_id;
        const dealerId = row.original.dealer_id;
        const quantity = row.original.quantity;

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
              <DropdownMenuItem
                onClick={() => {
                  setId(id);
                  openModal("delete");
                }}
              >
                Delete
              </DropdownMenuItem>
              {[ROLES.ADMIN, ROLES.CRE, ROLES.MANAGER].includes(user?.role) &&
                !["rejected", "order-created"].includes(
                  row.getValue("status"),
                ) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setVehicleId(vehicleId);
                        setVehicleColorId(vehicleColorId);
                        setVehicleVariantMapId(vehicleVariantMapId);
                        setDealerId(dealerId);
                        setMaxSelect(quantity);
                        setId(id);
                        openModal("dealer-order");
                      }}
                    >
                      Create order
                    </DropdownMenuItem>
                  </>
                )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ].filter(Boolean);
