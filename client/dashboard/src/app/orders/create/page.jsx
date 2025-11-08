import BookForm from "@/components/forms/book-form";
import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";

export default function CreatePage() {
  return (
    <PageContainer>
      <Heading title={"Create Book"} description="Create Book." />
      <BookForm type="create" />
    </PageContainer>
  );
}
