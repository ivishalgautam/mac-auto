"use client";
import ImportForm from "@/components/forms/import-form";
import PageContainer from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useImportDealers } from "@/mutations/dealer-mutation";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function ImportPage() {
  const router = useRouter();
  const createMutation = useImportDealers(() =>
    router.push("/dealers?page=1&limit=10"),
  );

  return (
    <PageContainer>
      <div className="flex items-start justify-between">
        <Heading title="Import Dealers" description="Import dealers." />
      </div>
      <div>
        <a
          download
          href="/dealer-import-format.csv"
          className={buttonVariants({ variant: "outline" })}
        >
          <Download /> Download Sample File
        </a>
      </div>
      <ImportForm createMutation={createMutation} />
    </PageContainer>
  );
}
