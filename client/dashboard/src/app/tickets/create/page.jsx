import TicketForm from "@/components/forms/ticket-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default async function CreatePage({ searchParams }) {
  const { inId, cid } = await searchParams;

  return (
    <PageContainer className="">
      <Heading title="Create ticket" description="Create ticket." />
      <TicketForm type={"create"} inventoryId={inId} customerId={cid} />
    </PageContainer>
  );
}
