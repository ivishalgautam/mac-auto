"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AtSign, KeyRound, Loader2, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { otpSchema } from "@/utils/schema/register";
import { useEffect, useState } from "react";
import auth from "@/services/auth";
import { toast } from "sonner";

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // rememberMe: z.boolean().optional(),
});

// API login function
const loginUser = async (data) => {
  return await axios.post("/api/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export default function LoginWithOTPForm() {
  const [step, setStep] = useState("login");
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    setValue: setOtpFormValue,
    control: otpFormControl,
    getValues: getOtpFormValues,
  } = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "", request_id: "" },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: ({ data }) => {
      setOtpFormValue("request_id", data.request_id);
      toast.success(
        "Please verify your account with the OTP sent to your mobile number."
      );
      setStep("otp");
      setResendTimer(10);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Login failed. Please check your credentials."
      );
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: auth.loginVerify,
    onSuccess: ({ data }) => {
      console.log({ data });
      delete data.user_data.password;
      localStorage.setItem("user", JSON.stringify(data.user_data));
      toast.success("Login successful!");
      router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Invalid OTP. Please try again."
      );
    },
  });

  const onOtpSubmit = (data) => {
    const payload = {
      ...getValues(),
      otp: data.otp,
      request_id: getOtpFormValues().request_id,
    };
    verifyOtpMutation.mutate(payload);
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      loginMutation.mutate({ ...getValues(), role: "admin" });
    }
  };

  const handleBackToRegister = () => {
    setStep("login");
  };

  const onSubmit = (data) => {
    loginMutation.mutate({ ...data, role: "admin" });
  };

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit(onOtpSubmit)}>
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Verify Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {"We've sent a 6-digit OTP to your mobile number"}
            </p>
            {/* <p className="mt-1 text-sm font-medium text-gray-900">
              {watch("mobile_number")}
            </p> */}
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="block text-center">Enter OTP</Label>
              <Controller
                name="otp"
                control={otpFormControl}
                render={({ field }) => (
                  <div className="flex items-center justify-center">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="size-12" />
                        <InputOTPSlot index={1} className="size-12" />
                        <InputOTPSlot index={2} className="size-12" />
                        <InputOTPSlot index={3} className="size-12" />
                        <InputOTPSlot index={4} className="size-12" />
                        <InputOTPSlot index={5} className="size-12" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                )}
              />
              {otpErrors.otp && (
                <p className="text-center text-sm text-red-500">
                  {otpErrors.otp.message}
                </p>
              )}
            </div>

            <Button className="w-full" disabled={verifyOtpMutation.isPending}>
              {verifyOtpMutation.isPending && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Verify OTP
            </Button>

            <div className="space-y-2 text-center">
              <p className="text-sm text-gray-600">
                {"Didn't receive the OTP?"}
              </p>
              <Button
                type="button"
                variant="link"
                onClick={handleResendOtp}
                disabled={resendTimer > 0 || loginMutation.isPending}
                className="h-auto p-0 text-primary"
              >
                {loginMutation.isPending ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    Resending...
                  </>
                ) : resendTimer > 0 ? (
                  `Resend OTP in ${resendTimer}s`
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleBackToRegister}
              className="w-full"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <Card className="">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="username"
                placeholder="johndoe"
                className="pl-10"
                {...register("username")}
              />
            </div>
            {errors.username && (
              <p className="text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {/* <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link> */}
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="pl-10"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            Sign in
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
