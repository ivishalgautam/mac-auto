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

export default function OrderForm({
  createMutation,
  vehicleId,
  dealerId = null,
  maxSelect = null,
}) {
  const methods = useForm({
    resolver: zodResolver(dealerInventorySchema),
    defaultValues: {
      dealer_id: dealerId ?? "",
      vehicle_id: vehicleId,
      chassis_numbers: [],
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
              name="dealer_id"
              control={control}
              render={({ field }) => (
                <DealerSelect
                  value={field.value}
                  onChange={field.onChange}
                  className={cn({
                    "border-red-500 dark:border-red-500": errors.dealer_id,
                  })}
                />
              )}
            />
          </div>

          {/* Chassis No. */}
          <div className="space-y-2">
            <Label>Chassis No.</Label>
            <Controller
              name="chassis_numbers"
              control={control}
              render={({ field }) => (
                <ChassisSelect
                  vehicleId={vehicleId}
                  onChange={(data) => {
                    field.onChange(data);
                  }}
                  className={cn({ "border-red-500": errors.chassis_numbers })}
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
