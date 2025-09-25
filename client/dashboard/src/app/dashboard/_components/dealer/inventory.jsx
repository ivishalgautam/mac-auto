import Loader from "@/components/loader";
import { Badge } from "@/components/ui/badge";
import ErrorMessage from "@/components/ui/error";
import { useGetDealerInventory } from "@/mutations/dealer-inventory.mutation";
import { Package } from "lucide-react";
import React from "react";

export default function Inventory() {
  const { data, isLoading, isError, error } = useGetDealerInventory("");

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;
  return (
    <div className="bg-card rounded-lg border">
      <div className="border-b p-4">
        <div className="text-muted-foreground grid grid-cols-12 gap-4 text-sm font-medium">
          <div className="col-span-6">Item</div>
          <div className="col-span-3 text-center">Quantity</div>
          <div className="col-span-3 text-center">Status</div>
        </div>
      </div>
      <div className="divide-y">
        {data.inventory.map((item, index) => (
          <ItemListItem
            key={index}
            title={item.title}
            activeQuantity={item.active_quantity}
          />
        ))}
      </div>
    </div>
  );
}

export function ItemListItem({ title, activeQuantity }) {
  const quantity = Number.parseInt(activeQuantity);
  const isOutOfStock = quantity === 0;

  return (
    <div className="hover:bg-muted/50 p-1 transition-colors">
      <div className="grid grid-cols-12 items-center gap-4">
        <div className="col-span-6 flex items-center gap-3">
          <Package className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="text-foreground truncate text-sm font-medium">
            {title}
          </span>
        </div>

        <div className="col-span-3 text-center">
          <span
            className={`text-md font-semibold ${isOutOfStock ? "text-destructive" : "text-foreground"}`}
          >
            {activeQuantity}
          </span>
        </div>

        <div className="col-span-3 text-center">
          <Badge
            variant={isOutOfStock ? "destructive" : "secondary"}
            className="text-xs"
          >
            {isOutOfStock ? "Out of Stock" : "In Stock"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
