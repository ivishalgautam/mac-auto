import VehicleVariantForm from "@/components/forms/vehicle-variant-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default async function EditPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="">
      <Heading title="Edit Model" description="Edit model." />
      <VehicleVariantForm type={"edit"} id={id} />
    </PageContainer>
  );
}
