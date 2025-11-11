import ForgotPasswordForm from "@/components/forms/forgot-password";
import AuthLayout from "@/components/layout/auth-layout";
import React, { Suspense } from "react";

export default function ForgotPasswordPage() {
  return (
    <Suspense>
      <AuthLayout title="" subtitle="">
        <ForgotPasswordForm type="forgot" />
      </AuthLayout>
    </Suspense>
  );
}
