import DealerTicketForm from "@/components/forms/dealer-ticket-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function CreatePage() {
  return (
    <PageContainer className="">
      <Heading title="Create ticket" description="Create ticket." />
      <DealerTicketForm type={"create"} />
    </PageContainer>
  );
}
