"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateVehicleEnquiry } from "@/mutations/vehicle-enquiry-mutation";
import { Textarea } from "../ui/textarea";

export default function RaiseVehicleEnquiryForm({
  vehicleId,
  callback = null,
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(
      z.object({
        quantity: z
          .number({ message: "Expected number" })
          .min(1, { message: "required*" }),
        message: z.string().optional(),
      }),
    ),
    defaultValues: { quantity: "" },
  });

  const createMutation = useCreateVehicleEnquiry(callback);
  const onSubmit = (data) => {
    createMutation.mutate({ vehicle_id: vehicleId, ...data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <div className="relative">
          <Input
            type="number"
            id="quantity"
            placeholder="Enter quantity"
            {...register("quantity", { valueAsNumber: true })}
          />
        </div>
        {errors.quantity && (
          <p className="text-destructive text-sm">{errors.quantity.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <div className="relative">
          <Textarea
            id="message"
            placeholder="Enter message"
            {...register("message")}
          />
        </div>
        {errors.message && (
          <p className="text-destructive text-sm">{errors.message.message}</p>
        )}
      </div>

      <div className="text-end">
        <Button type="submit" disabled={createMutation.isPending}>
          {createMutation.isPending && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Send
        </Button>
      </div>
    </form>
  );
}
