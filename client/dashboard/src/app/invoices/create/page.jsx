import InvoiceForm from "@/components/forms/invoice-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import React from "react";

export default async function CreatePage({ searchParams }) {
  return (
    <PageContainer className="">
      <Heading title="Create invoice" description="Create invoice." />
      <InvoiceForm type="create" />
    </PageContainer>
  );
}
