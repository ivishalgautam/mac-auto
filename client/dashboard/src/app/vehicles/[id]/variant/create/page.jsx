import VariantForm from "@/components/forms/variant-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Add variant",
  description: "Add variant",
};

export default async function CreatePage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="">
      <Heading title="Create variant" description="Create variant." />
      <VariantForm type={"create"} vehicleId={id} />
    </PageContainer>
  );
}
