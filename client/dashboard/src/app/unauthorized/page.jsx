"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LogIn, ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md space-y-6">
        <ShieldAlert className="text-destructive mx-auto h-16 w-16" />
        <h1 className="text-6xl font-bold">403</h1>
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">
          {"You don't have permission to access this resource."}
        </p>

        <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
