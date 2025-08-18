import WalkInEnquiryForm from "@/components/forms/walkin-enquiry";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import React from "react";

export default async function ViewPage({ params }) {
  const { id } = await params;
  return (
    <PageContainer className="p-8">
      <Heading
        title="View Walk In Enquiry"
        description="View Walk In Enquiry."
      />
      <WalkInEnquiryForm type={"view"} id={id} />
    </PageContainer>
  );
}
