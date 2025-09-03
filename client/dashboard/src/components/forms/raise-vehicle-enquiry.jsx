"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateVehicleEnquiry } from "@/mutations/vehicle-enquiry-mutation";
import { Textarea } from "../ui/textarea";
import ChassisSelectByColor from "@/features/chassis-select-by-color";
import VehicleColorSelect from "@/features/vehicle-color-select";
import { cn } from "@/lib/utils";
import { batteryTypes } from "@/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import VehicleVariantMapSelect from "@/features/vehicle-variant-map-select";

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
    watch,
  } = useForm({
    resolver: zodResolver(
      z.object({
        quantity: z
          .number({ message: "Expected number" })
          .min(1, { message: "required*" }),
        message: z.string().optional(),
        vehicle_color_id: z
          .string({ required_error: "Vehicle color ID is required" })
          .uuid()
          .min(1, { message: "Vehicle color ID is required" }),
        vehicle_variant_map_id: z
          .string({ required_error: "Vehicle variant ID is required" })
          .uuid()
          .min(1, { message: "Vehicle variant ID is required" }),
        battery_type: z.enum(
          batteryTypes.map(({ value }) => value),
          {
            message: "Battery type is required.",
          },
        ),
      }),
    ),
    defaultValues: { quantity: "", vehicle_color_id: "" },
  });
  const vehicleColorId = watch("vehicle_color_id");

  const createMutation = useCreateVehicleEnquiry(callback);
  const onSubmit = (data) => {
    createMutation.mutate({ vehicle_id: vehicleId, ...data });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* battery type */}
      <div className="space-y-2">
        <Label>Battery type</Label>
        <Controller
          name="battery_type"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className={"w-full"}>
                <SelectValue placeholder="Select battery type" />
              </SelectTrigger>
              <SelectContent>
                {batteryTypes.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* vehicle color id */}
      <div className="space-y-2">
        <Label>Color</Label>
        <Controller
          name="vehicle_color_id"
          control={control}
          render={({ field }) => (
            <VehicleColorSelect
              vehicleId={vehicleId}
              value={field.value}
              onChange={field.onChange}
              className={cn({
                "border-red-500 dark:border-red-500": errors.vehicle_color_id,
              })}
            />
          )}
        />
      </div>

      {/* vehicle variant id */}
      <div className="space-y-2">
        <Label>Variant</Label>
        <Controller
          name="vehicle_variant_map_id"
          control={control}
          render={({ field }) => (
            <VehicleVariantMapSelect
              vehicleId={vehicleId}
              value={field.value}
              onChange={field.onChange}
              className={cn({
                "border-red-500 dark:border-red-500":
                  errors.vehicle_variant_map_id,
              })}
            />
          )}
        />
      </div>

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
