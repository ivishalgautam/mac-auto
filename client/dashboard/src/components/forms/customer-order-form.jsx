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

export default function CustomerOrderForm({
  createMutation,
  vehicleId,
  customerId = null,
}) {
  const methods = useForm({
    resolver: zodResolver(customerOrderSchema),
    defaultValues: {
      customer_id: customerId ?? "",
      vehicle_id: vehicleId,
      chassis_number: "",
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

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = createMutation.isPending;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          {/* dealer id */}
          <div className="space-y-2">
            <Label>Dealer</Label>
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

          {/* Chassis No. */}
          <div className="space-y-2">
            <Label>Chassis No.</Label>
            <Controller
              name="chassis_number"
              control={control}
              render={({ field }) => (
                <ChassisSelect
                  vehicleId={vehicleId}
                  onChange={(data) => {
                    field.onChange(data[0].value);
                  }}
                  className={cn({ "border-red-500": errors.chassis_number })}
                  maxSelected={1}
                  onMaxSelected={(maxLimit) => {
                    toast.warning(`You have reached max selected: ${maxLimit}`);
                  }}
                />
              )}
            />
          </div>
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
