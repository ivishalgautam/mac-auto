"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rupee } from "@/lib/Intl";
import Link from "next/link";

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
      const variantColors = row.original.colors ?? [];
      const id = row.original.id;
      return (
        <div className="flex gap-1">
          {variantColors.length > 0 &&
            variantColors.map(({ color_hex }) => (
              <Link
                href={`/vehicles/${id}/inventory?page=1&limit=10&colors=${color_hex.replace("#", "%23")}`}
                key={color_hex}
                className="size-6 rounded-full"
                style={{ backgroundColor: color_hex }}
              ></Link>
            ))}
        </div>
      );
    },
  },
  {
    header: "Price",
    cell: ({ row }) => {
      const id = row.original.id;
      const price = row.original.dealer_price;
      return <Badge variant={"outline"}>{rupee.format(price)}</Badge>;
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
