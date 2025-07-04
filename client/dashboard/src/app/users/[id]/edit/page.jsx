import UserForm from "@/components/forms/user";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default async function UserEditPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="mx-auto max-w-lg">
      <Heading title="Edit User" description="Edit user." />
      <UserForm id={id} type="edit" />
    </PageContainer>
  );
}
