import VehicleVariantForm from "@/components/forms/vehicle-variant-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function CreatePage() {
  return (
    <PageContainer className="">
      <Heading title="Create Model" description="Create model." />
      <VehicleVariantForm type={"create"} />
    </PageContainer>
  );
}
