"use client";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useAuth } from "@/providers/auth-provider";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <div className="flex items-start justify-between">
      <Heading
        title={"Technicians"}
        description="Manage technicians (Create, Update, Delete)."
      />
      <Link
        href="/technicians/create"
        className={buttonVariants({ size: "sm" })}
      >
        <Plus size="15" />
        Create
      </Link>
    </div>
  );
}
