"use client";
import { Heading } from "@/components/ui/heading";
import { useAuth } from "@/providers/auth-provider";
import React from "react";

export default function Header() {
  const { user } = useAuth();
  return (
    <div className="flex items-start justify-between">
      <Heading
        title={user?.role === "dealer" ? "Stock" : "Dealer Orders"}
        description="Manage orders (Create, Update, Delete)."
      />
    </div>
  );
}
