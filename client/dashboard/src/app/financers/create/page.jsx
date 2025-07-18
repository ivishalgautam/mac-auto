import FinancerForm from "@/components/forms/financer";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function UserCreatePage() {
  return (
    <PageContainer className="">
      <Heading title="Create User" description="Create user." />
      <FinancerForm type={"create"} />
    </PageContainer>
  );
}
