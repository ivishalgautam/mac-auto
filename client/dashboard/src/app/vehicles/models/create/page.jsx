import VehicleForm from "@/components/forms/vehicle-form";
import VehicleModelForm from "@/components/forms/vehicle-model-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function CreatePage() {
  return (
    <PageContainer className="">
      <Heading title="Create Model" description="Create model." />
      <VehicleModelForm type={"create"} />
    </PageContainer>
  );
}
