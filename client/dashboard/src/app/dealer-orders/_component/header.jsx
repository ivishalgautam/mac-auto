"use client";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useAuth } from "@/providers/auth-provider";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Header() {
  const { user } = useAuth();
  return (
    <div className="flex items-start justify-between">
      <Heading
        title={user?.role === "dealer" ? "My Orders" : "Dealer Orders"}
        description="Manage orders (Create, Update, Delete)."
      />
      <Link
        href="/dealer-orders/create"
        className={buttonVariants({ size: "sm" })}
      >
        <Plus size="15" />
        Add ticket
      </Link>
    </div>
  );
}
