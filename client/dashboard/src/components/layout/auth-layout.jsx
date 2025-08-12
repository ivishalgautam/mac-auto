import { cn } from "@/lib/utils";
import React from "react";
import { Card, CardContent } from "../ui/card";
import Image from "next/image";

export default function AuthLayout({ children, className }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {children}
          <div className="bg-muted hidden p-6 md:block">
            <Image
              src="/login.svg"
              alt="Image"
              width={200}
              height={200}
              className="h-full w-full object-contain"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
