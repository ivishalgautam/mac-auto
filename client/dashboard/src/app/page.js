import LoginForm from "@/components/forms/login";
import AuthLayoutWrapper from "@/components/layout/auth-layout-wrapper";

export default function Home() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center">
      <div className="w-full">
        <AuthLayoutWrapper>
          <LoginForm />
        </AuthLayoutWrapper>
      </div>
    </div>
  );
}
