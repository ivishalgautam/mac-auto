import UserForm from "@/components/forms/user";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Create dealer",
  description: "Create dealer",
};

export default function CreatePage() {
  return (
    <PageContainer className="mx-auto max-w-lg">
      <Heading title="Create dealer" description="Create dealer." />
      <UserForm type={"create"} role="dealer" />
    </PageContainer>
  );
}
