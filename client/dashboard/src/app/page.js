import LoginForm from "@/components/forms/login";
import AuthLayoutWrapper from "@/components/layout/auth-layout-wrapper";

export default async function Home({ searchParams }) {
  return (
    <AuthLayoutWrapper>
      <LoginForm />
    </AuthLayoutWrapper>
  );
}
