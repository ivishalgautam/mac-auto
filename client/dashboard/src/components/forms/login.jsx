"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { AtSign, KeyRound, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRole } from "@/lib/role-context";

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "dealer", "customer"], {
    message: "Please select role.",
  }),
});

// API login function
const loginUser = async (data) => {
  await axios.post("/api/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export default function LoginForm({}) {
  const role = useRole();
  console.log(role);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      role: role ?? "admin",
    },
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast.success("Login successful!");
      router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Login failed. Please check your credentials.",
      );
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* role */}
      {/* <div className="space-y-2">
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger
                className={cn("w-full border-gray-700", {
                  "border-red-500": errors.role,
                })}
              >
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="dealer">Dealer</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.role && (
          <p className="text-destructive text-sm">{errors.role.message}</p>
        )}
      </div> */}

      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <div className="relative">
          <AtSign className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
          <Input
            id="username"
            placeholder="johndoe"
            className={cn("pl-10", {
              "border-red-500": errors.username,
            })}
            {...register("username")}
          />
        </div>
        {errors.username && (
          <p className="text-destructive text-sm">{errors.username.message}</p>
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
          <KeyRound className="text-muted-foreground absolute top-2.5 left-3 h-5 w-5" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className={cn("pl-10", {
              "border-red-500": errors.password,
            })}
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
      </div>

      <Button className="w-full" disabled={loginMutation.isPending}>
        {loginMutation.isPending && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        Sign in
      </Button>
    </form>
  );
}
