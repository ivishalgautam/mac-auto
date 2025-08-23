"use client";

import dynamic from "next/dynamic";
import LoginForm from "@/components/forms/login";
const AuthLayout = dynamic(() => import("@/components/layout/auth-layout"), {
  ssr: false,
});

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
