import LoginForm from "@/components/forms/login";
import AuthLayout from "@/components/layout/auth-layout";

export default function Home() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center">
      <div className="w-full">
        <AuthLayout>
          <LoginForm />
        </AuthLayout>
      </div>
    </div>
  );
}
