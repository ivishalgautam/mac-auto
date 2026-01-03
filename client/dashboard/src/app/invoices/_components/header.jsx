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
    <div className="flex items-center justify-between">
      <Heading
        title={"Invoices"}
        description={"Manage Invoices (View, Delete)."}
      />
      {["dealer"].includes(user?.role) && (
        <Link
          href={"/invoices/create?t=walk-in"}
          className={buttonVariants({ size: "sm" })}
        >
          <Plus /> Create
        </Link>
      )}
    </div>
  );
}
