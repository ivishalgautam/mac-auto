"use client";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const login = async (data) => {
  await axios.post("/api/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export default function LoginForm() {
  const {
    handleSubmit,
    formState: { errors },
    register,
  } = useForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      router.replace("/");
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Something went wrong!"
      );
    },
  });

  async function onSubmit(data) {
    loginMutation.mutate(data);
  }

  return (
    <form
      className="flex flex-col gap-4 max-w-xl mx-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input type="text" {...register("username")} placeholder="Username" />
      <Input type="password" {...register("password")} placeholder="********" />
      <Button type="submit" disabled={loginMutation.isPending}>
        {loading ? "Loading..." : "Login"}
      </Button>
    </form>
  );
}
