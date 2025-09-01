import TechnicianForm from "@/components/forms/technician-form";
import TicketForm from "@/components/forms/ticket-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default async function EditsPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="">
      <Heading title="Edit technicians" description="Edit technicians." />
      <TechnicianForm type={"edit"} id={id} />
    </PageContainer>
  );
}
