"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  useCreateTechnician,
  useUpdateTechnician,
  useGetTechnician,
} from "@/mutations/technician-mutation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import PhoneSelect from "../ui/phone-input";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useCreatePart, usePart, useUpdatePart } from "@/mutations/use-parts";

// --- Zod schema ---
export const partSchema = z.object({
  part_name: z.string().min(1, { message: "Part name is required" }),
});

const defaultValues = {
  part_name: "",
};

export default function PartForm({ type = "create", id }) {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(partSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    control,
    formState: { errors },
  } = methods;

  const createMutation = useCreatePart(() =>
    router.push("/parts?page=1&limit=10"),
  );
  const updateMutation = useUpdatePart(id, () => router.back());
  const { data, isLoading, isError, error } = usePart(id);

  useEffect(() => {
    if (type === "edit" && data) {
      reset({ ...data });
    }
  }, [data, type, reset]);

  const onSubmit = (formData) => {
    if (type === "create") {
      createMutation.mutate(formData);
    } else {
      updateMutation.mutate(formData);
    }
  };

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError)
    return <ErrorMessage error={error?.message} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Part Name</Label>
        <Input
          type="text"
          placeholder="Enter name"
          {...register("part_name")}
          className={errors.part_name ? "border-red-500" : ""}
        />
        {errors.part_name && (
          <p className="text-sm text-red-500">{errors.part_name.message}</p>
        )}
      </div>

      <div className="text-end">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className="animate-spin" />
          )}
          Submit
        </Button>
      </div>
    </form>
  );
}
