import PartForm from "@/components/forms/part-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default async function PartUpdatePage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="mx-auto max-w-sm">
      <Heading title="Update part" description="Update part." />
      <PartForm type={"edit"} id={id} />
    </PageContainer>
  );
}
