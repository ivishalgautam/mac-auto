import UserForm from "@/components/forms/user";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function UserCreatePage() {
  return (
    <PageContainer className="mx-auto max-w-lg">
      <Heading title="Create User" description="Create user." />
      <UserForm type={"create"} />
    </PageContainer>
  );
}
