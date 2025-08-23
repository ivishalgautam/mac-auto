"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import DealerSelect from "@/features/dealer-select";
import { dealerInventorySchema } from "@/utils/schema/dealer-inventory.schema";
import ChassisSelect from "@/features/chassis-select";
import { toast } from "sonner";
import CustomerSelect from "@/features/customer-select";
import { customerOrderSchema } from "@/utils/schema/customer-order.schema";
import VehicleColorSelect from "@/features/vehicle-color-select";
import ChassisSelectByColor from "@/features/chassis-select-by-color";
import DealerVehicleColorSelect from "@/features/dealer-vehicle-color-select";

export default function CustomerOrderForm({
  createMutation,
  vehicleId,
  customerId = null,
  maxSelect = 1,
}) {
  const methods = useForm({
    resolver: zodResolver(customerOrderSchema),
    defaultValues: {
      customer_id: customerId ?? "",
      vehicle_id: vehicleId,
      chassis_number: "",
      vehicle_color_id: "",
    },
  });
  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
  } = methods;
  const onSubmit = (data) => {
    createMutation.mutate(data);
  };
  const vehicleColorId = watch("vehicle_color_id");

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = createMutation.isPending;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          {/* customer id */}
          <div className="space-y-2">
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
                />
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
                <DealerVehicleColorSelect
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

          {/* Chassis No. */}
          {vehicleColorId && (
            <div className="space-y-2">
              <Label>Chassis No.</Label>
              <Controller
                name="chassis_number"
                control={control}
                render={({ field }) => (
                  <ChassisSelectByColor
                    vehicleColorId={vehicleColorId}
                    onChange={(data) => {
                      field.onChange(data);
                    }}
                    className={cn({ "border-red-500": errors.chassis_number })}
                    {...(maxSelect
                      ? {
                          maxSelected: maxSelect,
                          onMaxSelected: (maxLimit) => {
                            toast.warning(
                              `You have reached max selected: ${maxLimit}`,
                            );
                          },
                        }
                      : {})}
                  />
                )}
              />
            </div>
          )}
        </div>

        {/* errors print */}
        {hasErrors && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="mb-2 font-medium">
                Please fix the following errors:
              </div>
              <ul className="list-inside list-disc space-y-1">
                {formErrors.map((err, i) => (
                  <li key={i} className="text-sm">
                    {err}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-end">
          <Button
            type="submit"
            disabled={isFormPending || !isDirty}
            className="w-full sm:w-auto"
          >
            {isFormPending && (
              <LoaderCircleIcon className="-ms-1 animate-spin" size={16} />
            )}
            Submit
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
