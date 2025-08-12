import UserForm from "@/components/forms/user";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export const metadata = {
  title: "Edit customer",
  description: "Edit customer",
};

export default async function EditPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer className="mx-auto max-w-lg">
      <Heading title="Edit customer" description="Edit customer." />
      <UserForm id={id} type="edit" role={"customer"} />
    </PageContainer>
  );
}
