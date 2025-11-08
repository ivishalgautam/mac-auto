import BookForm from "@/components/forms/book-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default async function EditPage({ params }) {
  const { id } = await params;

  return (
    <PageContainer>
      <Heading title={"Edit book"} description="Edit book." />
      <BookForm type="edit" id={id} />
    </PageContainer>
  );
}
