import QuotationForm from "@/components/forms/quotation-form";
import WalkInEnquiryForm from "@/components/forms/walkin-enquiry";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import React from "react";

export default async function EditPage({ params }) {
  const { id } = await params;
  return (
    <PageContainer className="">
      <Heading title="Edit Quotation" description="Edit Quotation." />
      <QuotationForm type={"edit"} id={id} />
    </PageContainer>
  );
}
