"use client";
import ForgotPasswordForm from "@/components/forms/forgot-password";
import AuthLayout from "@/components/layout/auth-layout";
import React, { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <AuthLayout title="" subtitle="">
        <ForgotPasswordForm type="reset" />
      </AuthLayout>
    </Suspense>
  );
}
