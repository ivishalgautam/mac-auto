import InvoiceForm from "@/components/forms/invoice-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import React from "react";

export default async function EditPage({ params }) {
  const { id } = await params;
  return (
    <PageContainer className="">
      <Heading title="Edit Invoice" description="Edit invoice." />
      <InvoiceForm type={"edit"} id={id} />
    </PageContainer>
  );
}
