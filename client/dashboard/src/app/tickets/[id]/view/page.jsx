import TicketForm from "@/components/forms/ticket-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default async function ViewPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="">
      <Heading title="View ticket" description="View ticket." />
      <TicketForm type={"view"} id={id} />
    </PageContainer>
  );
}
