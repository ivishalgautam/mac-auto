import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import React from "react";
import DownloadQuotation from "../../_components/download-quotation";

export default async function QuoatationDownloadPage({ params }) {
  const { id } = await params;
  return (
    <PageContainer className="">
      <Heading title="Download Quotation" description="Download Quotation." />
      <DownloadQuotation type={"edit"} id={id} />
    </PageContainer>
  );
}
