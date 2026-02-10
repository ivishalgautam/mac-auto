import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import TicketUpdates from "../../../../components/ticket-updates";

export default async function UpdatesPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="">
      <Heading title="Ticket updates" description="Ticket updates." />
      <TicketUpdates dealerTicketId={id} />
    </PageContainer>
  );
}
