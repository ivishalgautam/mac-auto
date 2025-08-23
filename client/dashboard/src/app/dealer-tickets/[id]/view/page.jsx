import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import TicketView from "../../_component/ticket-view";
import DealerTicketForm from "@/components/forms/dealer-ticket-form";

export default async function ViewPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="">
      <Heading title="View ticket" description="View ticket." />
      <DealerTicketForm id={id} type={"view"} />
    </PageContainer>
  );
}
