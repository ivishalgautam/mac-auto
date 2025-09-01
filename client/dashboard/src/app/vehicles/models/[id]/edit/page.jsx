import VehicleModelForm from "@/components/forms/vehicle-model-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default async function EditPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="">
      <Heading title="Edit Model" description="Edit model." />
      <VehicleModelForm type={"edit"} id={id} />
    </PageContainer>
  );
}
