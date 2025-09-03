import WalkInEnquiryView from "@/components/forms/walkin-enquiry-view";
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
      <WalkInEnquiryView type={"view"} id={id} />
    </PageContainer>
  );
}
