import QuotationForm from "@/components/forms/quotation-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import React from "react";

export default async function CreatePage({ searchParams }) {
  const { enqId } = await searchParams;

  return (
    <PageContainer className="">
      <Heading title="Create quotation" description="Create quotation." />
      <QuotationForm enquiryId={enqId} type="create" />
    </PageContainer>
  );
}
