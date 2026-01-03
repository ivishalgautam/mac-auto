import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import React from "react";
import DownloadInvoice from "../../_components/download-invoice";

export default async function QuoatationDownloadPage({ params }) {
  const { id } = await params;
  return (
    <PageContainer className="">
      <Heading title="Download Invoice" description="Download Invoice." />
      <DownloadInvoice type={"edit"} id={id} />
    </PageContainer>
  );
}
