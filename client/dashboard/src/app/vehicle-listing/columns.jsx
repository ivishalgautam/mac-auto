"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import config from "@/config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
    header: "Marketing Materials",
    cell: ({ row }) => {
      const data = row.original?.marketing_material ?? [];

      // Don't render anything if no materials
      if (!data.length) {
        return <span className="text-gray-400">No materials</span>;
      }

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" className="text-white">
              {data.length} file{data.length !== 1 ? "s" : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-2">
              <h4 className="mb-2 text-sm font-medium">Marketing Materials</h4>
              {data.map((file, index) => {
                const fileName = file.split(/[/\\]/).pop();
                return (
                  <div key={index}>
                    <Badge variant={"outline"}>
                      <a
                        href={`${config.file_base}/${file}`}
                        download
                        className="block text-sm text-blue-600 underline hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                      >
                        {fileName}
                      </a>
                    </Badge>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      );
    },
  },
  {
    header: "Brochure",
    cell: ({ row }) => {
      const data = row.original?.brochure ?? [];

      if (!data.length) {
        return <span className="text-gray-400">No brochure</span>;
      }

      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" className="text-white">
              {data.length} file{data.length !== 1 ? "s" : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-2">
              <h4 className="mb-2 text-sm font-medium">Brochure</h4>
              {data.map((file, index) => {
                const fileName = file.split(/[/\\]/).pop();
                return (
                  <div key={index}>
                    <Badge variant={"outline"}>
                      <a
                        href={`${config.file_base}/${file}`}
                        download
                        className="block text-sm text-blue-600 underline hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                        target="_blank"
                      >
                        {fileName}
                      </a>
                    </Badge>
                  </div>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
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
