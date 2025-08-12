import UserForm from "@/components/forms/user";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Create customer",
  description: "Create customer",
};

export default function CreatePage() {
  return (
    <PageContainer className="mx-auto max-w-lg">
      <Heading title="Create customer" description="Create customer." />
      <UserForm type={"create"} role="customer" />
    </PageContainer>
  );
}
