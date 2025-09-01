import TechnicianForm from "@/components/forms/technician-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function CreatePage() {
  return (
    <PageContainer className="">
      <Heading title="Create technicians" description="Create technicians." />
      <TechnicianForm type={"create"} />
    </PageContainer>
  );
}
