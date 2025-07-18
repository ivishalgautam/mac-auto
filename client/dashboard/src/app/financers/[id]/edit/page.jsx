import FinancerForm from "@/components/forms/financer";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Edit User",
  description: "Edit User",
};

export default async function FinancerEditPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer>
      <Heading title="Edit Financer" description="Edit financer." />
      <FinancerForm id={id} type="edit" />
    </PageContainer>
  );
}
