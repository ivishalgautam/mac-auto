import PartForm from "@/components/forms/part-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function PartCreatePage() {
  return (
    <PageContainer className="mx-auto max-w-sm">
      <Heading title="Create part" description="Create part." />
      <PartForm type={"create"} />
    </PageContainer>
  );
}
