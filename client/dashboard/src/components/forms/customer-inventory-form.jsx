"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "../ui/label";
import { customerInventorySchema } from "@/utils/schema/customer-inventory.schema";
import CustomerSelect from "@/features/customer-select";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useGetFormattedVehicles } from "@/mutations/vehicle-mutation";
import CustomSelect from "../ui/custom-select";
import { useCustomerInventory } from "@/mutations/use-customer-inventories";
import { useEffect } from "react";

export default function CustomerInventoryForm({
  createMutation,
  updateMutation,
  type,
  customerId,
  id,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(customerInventorySchema),
    defaultValues: {
      vehicle_id: "",
      customer_id: customerId ? customerId : "",
      chassis_no: "",
      motor_no: "",
      battery_no: "",
      controller_no: "",
      charger_no: "",
    },
  });

  const {
    data: vehiclesData,
    isLoading: isVehiclesLoading,
    isError: isVehiclesError,
    error: vehiclesError,
  } = useGetFormattedVehicles("");

  const { data, isLoading, isError, error } = useCustomerInventory(id);

  useEffect(() => {
    if (data) {
      console.log({ data });
      reset({
        vehicle_id: data.vehicle_id,
        customer_id: data.customer_id,
        chassis_no: data.chassis_no,
        motor_no: data.motor_no,
        battery_no: data.battery_no,
        controller_no: data.controller_no,
        charger_no: data.charger_no,
      });
    }
  }, [data]);

  const onSubmit = (data) => {
    type === "create"
      ? createMutation.mutate(data)
      : updateMutation.mutate(data);
  };

  const isPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Vehicle */}
        <div className="col-span-full">
          <Label>Models *</Label>
          <Controller
            name="vehicle_id"
            control={control}
            render={({ field }) => (
              <CustomSelect
                options={vehiclesData}
                isLoading={isVehiclesLoading}
                isError={isVehiclesError}
                error={vehiclesError}
                async
                placeholder="Select vehicle"
                value={field.value}
                onChange={field.onChange}
                className={cn({
                  "border-destructive": errors.vehicle_id,
                })}
              />
            )}
          />
          {errors.vehicle_id && (
            <span className="text-destructive text-xs">
              {errors.vehicle_id.message}
            </span>
          )}
        </div>

        {/* customer id */}
        <div className="col-span-full space-y-2">
          <Label>Customer</Label>
          <Controller
            name="customer_id"
            control={control}
            render={({ field }) => (
              <CustomerSelect
                value={field.value}
                onChange={field.onChange}
                className={cn({
                  "border-red-500 dark:border-red-500": errors.customer_id,
                })}
                disabled={customerId}
              />
            )}
          />
        </div>

        {/* Chassis */}
        <div>
          <Label className="mb-1 block text-sm font-medium">Chassis No *</Label>
          <Input {...register("chassis_no")} />
          {errors.chassis_no && (
            <p className="mt-1 text-xs text-red-500">
              {errors.chassis_no.message}
            </p>
          )}
        </div>

        {/* Motor */}
        <div>
          <Label className="mb-1 block text-sm font-medium">Motor No *</Label>
          <Input {...register("motor_no")} />
          {errors.motor_no && (
            <p className="mt-1 text-xs text-red-500">
              {errors.motor_no.message}
            </p>
          )}
        </div>

        {/* Battery */}
        <div>
          <Label className="mb-1 block text-sm font-medium">Battery No *</Label>
          <Input {...register("battery_no")} />
          {errors.battery_no && (
            <p className="mt-1 text-xs text-red-500">
              {errors.battery_no.message}
            </p>
          )}
        </div>

        {/* Controller */}
        <div>
          <Label className="mb-1 block text-sm font-medium">
            Controller No *
          </Label>
          <Input {...register("controller_no")} />
          {errors.controller_no && (
            <p className="mt-1 text-xs text-red-500">
              {errors.controller_no.message}
            </p>
          )}
        </div>

        {/* Charger */}
        <div>
          <Label className="mb-1 block text-sm font-medium">Charger No *</Label>
          <Input {...register("charger_no")} />
          {errors.charger_no && (
            <p className="mt-1 text-xs text-red-500">
              {errors.charger_no.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />} Submit
        </Button>
      </div>
    </form>
  );
}
