import VehicleForm from "@/components/forms/vehicle-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Edit Vehicle",
  description: "Edit Vehicle",
};

export default async function UserEditPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer>
      <Heading title="Edit Vehicle" description="Edit Vehicle." />
      <VehicleForm id={id} type="edit" />
    </PageContainer>
  );
}
