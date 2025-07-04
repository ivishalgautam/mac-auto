import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function ProductsPage() {
  return (
    <div className="flex items-center justify-start gap-4 flex-wrap">
      {Array.from({ length: 1000 }).map((_, ind) => (
        <Link
          key={ind}
          href={`/products/${ind + 1}`}
          className={buttonVariants({ variant: "outline" })}
        >
          Product {ind + 1}
        </Link>
      ))}
    </div>
  );
}
