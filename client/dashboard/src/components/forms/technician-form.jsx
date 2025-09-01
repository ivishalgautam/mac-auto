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

// --- Zod schema ---
export const technicianSchema = z
  .object({
    technician_name: z
      .string()
      .min(1, { message: "Technician name is required" }),
    technician_phone: z
      .string()
      .min(1, { message: "Phone number is required" }),
  })
  .refine((data) => isValidPhoneNumber(data.technician_phone), {
    path: ["technician_phone"],
    message: "Invalid phone number",
  });

const defaultValues = {
  technician_name: "",
  technician_phone: "",
};

export default function TechnicianForm({ type = "create", id }) {
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(technicianSchema),
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

  const createMutation = useCreateTechnician(() => router.push("/technicians"));
  const updateMutation = useUpdateTechnician(id, () =>
    router.push("/technicians"),
  );
  const { data, isLoading, isError, error } = useGetTechnician(id);

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
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label>Technician Name</Label>
          <Input
            type="text"
            placeholder="Enter name"
            {...register("technician_name")}
            className={errors.technician_name ? "border-red-500" : ""}
          />
          {errors.technician_name && (
            <p className="text-sm text-red-500">
              {errors.technician_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Controller
            control={control}
            name="technician_phone"
            render={({ field }) => (
              <PhoneSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter phone number"
                className={cn({
                  "border border-red-500": errors.technician_phone,
                })}
              />
            )}
          />
          {errors.technician_phone && (
            <p className="text-sm text-red-500">
              {errors.technician_phone.message}
            </p>
          )}
        </div>
      </div>

      <div className="text-end">
        <Button
          type="submit"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          {(createMutation.isPending || updateMutation.isPending) && (
            <Loader2 className="animate-spin" />
          )}
          {type === "create" ? "Create Technician" : "Update Technician"}
        </Button>
      </div>
    </form>
  );
}
