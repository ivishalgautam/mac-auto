"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import auth from "@/services/auth";
import { otpSchema, userFormSchema } from "@/utils/schema/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { RiGoogleFill } from "@remixicon/react";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import PhoneSelect from "../ui/phone-input";
import { Separator } from "../ui/separator";
import { parsePhoneNumber } from "react-phone-number-input";

export default function UserWithVerificationForm() {
  const [step, setStep] = useState("register"); // "register" or "otp"
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    getValues,
    setValue,
  } = useForm({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      mobile_number: "",
      first_name: "",
      last_name: "",
      password: "",
      role: "user",
      terms: false,
    },
  });

  const mobileNumber = watch("mobile_number");
  const formattedNumber = parsePhoneNumber(mobileNumber);

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
  const router = useRouter();

  // Timer effect for resend OTP
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const registerMutation = useMutation({
    mutationFn: auth.registerRequest,
    onSuccess: ({ data }) => {
      setOtpFormValue("request_id", data.request_id);
      toast({
        title: "OTP Sent Successful",
        description:
          "Please verify your account with the OTP sent to your mobile number.",
      });
      setStep("otp");
      setResendTimer(10);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description:
          error?.response?.data?.message ??
          error?.message ??
          "Something went wrong!",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: auth.registerVerify,
    onSuccess: (data) => {
      toast({
        title: "Verification Successful",
        description: "Your account has been verified successfully.",
      });
      router.push("/login");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description:
          error?.response?.data?.message ??
          error?.message ??
          "Invalid OTP. Please try again.",
      });
    },
  });

  const onSubmit = (data) => {
    registerMutation.mutate(data);
  };

  const onOtpSubmit = (data) => {
    const payload = {
      ...getValues(),
      username: formattedNumber.nationalNumber,
      otp: data.otp,
      request_id: getOtpFormValues().request_id,
    };
    console.log({ payload });
    verifyOtpMutation.mutate(payload);
  };

  const handleResendOtp = () => {
    if (resendTimer === 0) {
      registerMutation.mutate({ ...getValues() });
    }
  };

  const handleBackToRegister = () => {
    setValue("mobile_number", "");
    setStep("register");
  };

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
            <p className="mt-1 text-sm font-medium text-gray-900">
              {watch("mobile_number")}
            </p>
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
                disabled={resendTimer > 0 || registerMutation.isPending}
                className="h-auto p-0 text-primary"
              >
                {registerMutation.isPending ? (
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
              Back to Registration
            </Button>
          </div>
        </div>
      </form>
    );
  }

  return (
    <div className="mx-auto w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-2xl font-extrabold text-secondary">
          User Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {"Already have an account? "}
          <Link href={`/login`} className={"font-medium text-primary"}>
            Login
          </Link>
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4 gap-y-2">
          {/* First Name */}
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              placeholder="Enter your first name"
              {...register("first_name")}
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && (
              <p className="text-sm text-red-500">
                {errors.first_name.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              placeholder="Enter your last name"
              {...register("last_name")}
              className={errors.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && (
              <p className="text-sm text-red-500">{errors.last_name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="col-span-full space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="text"
              placeholder="Enter your email"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="col-span-full space-y-2">
            <Label htmlFor="mobile_number">Mobile Number *</Label>
            <Controller
              control={control}
              name="mobile_number"
              render={({ field }) => (
                <PhoneSelect
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Enter your mobile number"
                  className={errors.mobile_number ? "border-red-500" : ""}
                />
              )}
            />
            {errors.mobile_number && (
              <p className="text-sm text-red-500">
                {errors.mobile_number.message}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              {...register("username")}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="relative space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="relative space-y-2">
            <Label htmlFor="confirm_password">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                {...register("confirm_password")}
                className={
                  errors.confirm_password ? "border-red-500 pr-10" : "pr-10"
                }
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirm_password && (
              <p className="text-sm text-red-500">
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending && (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          )}
          Register
        </Button>

        {/* separator */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
      </form>
    </div>
  );
}
