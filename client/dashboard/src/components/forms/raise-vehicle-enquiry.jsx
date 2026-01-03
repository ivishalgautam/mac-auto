"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useCreateVehicleEnquiry,
  useUpdateVehicleEnquiry,
} from "@/mutations/vehicle-enquiry-mutation";
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

const createSchema = z.object({
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
    { message: "Battery type is required." },
  ),
});

const updateSchema = z
  .object({
    status: z.enum(["pending", "accepted", "rejected", "order-created"], {
      message: "Select listed status.",
    }),
    remarks: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "rejected" && !data.remarks) {
      ctx.addIssue({
        path: ["remarks"],
        code: z.ZodIssueCode.custom,
        message: "Please add remarks*",
      });
    }
  });

export default function RaiseVehicleEnquiryForm({
  vehicleId,
  callback = null,
  type = "create",
  id,
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
  } = useForm({
    resolver: zodResolver(type === "create" ? createSchema : updateSchema),
    defaultValues: { quantity: "", vehicle_color_id: "" },
  });

  const vehicleColorId = watch("vehicle_color_id");

  const createMutation = useCreateVehicleEnquiry(callback);
  const updateMutation = useUpdateVehicleEnquiry(id, callback);

  const onSubmit = (data) => {
    type === "create"
      ? createMutation.mutate({ vehicle_id: vehicleId, ...data })
      : updateMutation.mutate(data);
  };

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {type === "create" ? (
        <>
          {/* battery type */}
          <div className="space-y-2">
            <Label>Battery type</Label>
            <Controller
              name="battery_type"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                    "border-red-500 dark:border-red-500":
                      errors.vehicle_color_id,
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
              <p className="text-destructive text-sm">
                {errors.quantity.message}
              </p>
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
              <p className="text-destructive text-sm">
                {errors.message.message}
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => {
                return (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={"w-full capitalize"}>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {["pending", "accepted", "rejected"].map((option) => (
                        <SelectItem
                          key={option}
                          value={option}
                          className={"capitalize"}
                        >
                          {option.split("-").join(" ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {errors.status && (
              <p className="text-destructive text-sm">
                {errors.status.message}
              </p>
            )}
          </div>

          {watch("status") === "rejected" && (
            <div className="space-y-2">
              <Label htmlFor="remarks">Remarks</Label>
              <div className="relative">
                <Textarea
                  id="remarks"
                  placeholder="Enter remarks"
                  {...register("remarks")}
                />
              </div>
              {errors.remarks && (
                <p className="text-destructive text-sm">
                  {errors.remarks.message}
                </p>
              )}
            </div>
          )}
        </>
      )}

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Send
        </Button>
      </div>
    </form>
  );
}
