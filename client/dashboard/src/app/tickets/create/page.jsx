import FinancerForm from "@/components/forms/financer";
import TicketForm from "@/components/forms/ticket-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function CreatePage() {
  return (
    <PageContainer className="">
      <Heading title="Create ticket" description="Create ticket." />
      <TicketForm type={"create"} />
    </PageContainer>
  );
}
