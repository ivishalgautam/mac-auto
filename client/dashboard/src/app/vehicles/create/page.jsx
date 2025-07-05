import VehicleForm from "@/components/forms/vehicle-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function VehicleCreatePage() {
  return (
    <PageContainer className="">
      <Heading title="Create Vehicle" description="Create Vehicle." />
      <VehicleForm type={"create"} />
    </PageContainer>
  );
}
