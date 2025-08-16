import WalkInEnquiryForm from "@/components/forms/walkin-enquiry";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import React from "react";

export default function CreatePage() {
  return (
    <PageContainer className="">
      <Heading
        title="Create Walk In Enquiry"
        description="Create Walk In Enquiry."
      />
      <WalkInEnquiryForm type={"create"} />
    </PageContainer>
  );
}
