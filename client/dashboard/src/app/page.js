import LoginForm from "@/components/forms/login";
import AuthLayout from "@/components/layout/auth-layout";

export default function Home() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <AuthLayout>
          <LoginForm />
        </AuthLayout>
      </div>
    </div>
  );
}
