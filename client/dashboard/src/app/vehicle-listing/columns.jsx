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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import config from "@/config";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
