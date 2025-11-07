"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ImportForm({ createMutation }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      file: null,
    },
  });

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("file", data.file[0]);
      await createMutation.mutateAsync(formData);
      reset();
    } catch (error) {
      console.error("Submit failed:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-card mx-auto w-full max-w-md space-y-5 rounded-2xl border p-6 shadow"
    >
      <div className="space-y-2">
        <Label htmlFor="file">Upload File</Label>
        <Input
          id="file"
          type="file"
          accept=".csv,.xls,.xlsx"
          {...register("file", { required: "File is required" })}
        />
        {errors.file && (
          <p className="text-sm text-red-500">{errors.file.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || createMutation.isPending}
      >
        {isSubmitting || createMutation.isPending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
