import VariantForm from "@/components/forms/variant-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Edit variant",
  description: "Edit variant",
};

export default async function CreatePage({ params, searchParams }) {
  const { id } = await params;
  const { vid } = await searchParams;

  return (
    <PageContainer className="">
      <Heading title="Edit variant" description="Edit variant." />
      <VariantForm type={"edit"} vehicleId={id} id={vid} />
    </PageContainer>
  );
}
