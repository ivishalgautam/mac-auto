"use client";

import { Search, Car, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VehicleNotFound({
  message = "No vehicles found",
  className = "",
}) {
  return (
    <div
      className={`bg-card border-border flex flex-col items-center justify-center rounded-xl border p-12 text-center ${className}`}
    >
      {/* Icon */}
      <div className="relative mb-6">
        <div className="bg-muted flex h-20 w-20 items-center justify-center rounded-full">
          <Car className="text-muted-foreground h-10 w-10" />
        </div>
        <div className="bg-destructive/10 absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full">
          <Search className="text-destructive h-4 w-4" />
        </div>
      </div>

      {/* Message */}
      <h3 className="text-foreground mb-2 text-xl font-semibold">{message}</h3>
    </div>
  );
}
