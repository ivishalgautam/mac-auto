const WalkInEnquiryForm = dynamic(
  () => import("@/components/forms/walkin-enquiry"),
);
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";

export default function CreatePage() {
  return (
    <PageContainer className="">
      <Heading
        title="Create Walk In Enquiry"
        description="Create Walk In Enquiry."
      />
      <Suspense>
        <WalkInEnquiryForm type={"create"} />
      </Suspense>
    </PageContainer>
  );
}
