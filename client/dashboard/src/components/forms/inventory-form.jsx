"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useEffect } from "react";
import { inventorySchema } from "@/utils/schema/vehicle.schema";
import { ScrollArea } from "../ui/scroll-area";

const defaultValues = {
  quantity: "",
};

export default function InventoryForm({ createMutation }) {
  const methods = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = methods;

  const quantity = watch("quantity");

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = createMutation.isPending;

  useEffect(() => {
    if (quantity > 0) {
      const chassisNumbers = Array.from({ length: quantity }, (_, i) => ({
        number: "",
      }));
      setValue("chassis_numbers", chassisNumbers);
    }
  }, [quantity, setValue]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="">
          {/* quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              placeholder="Enter quantity"
              {...register(`quantity`, { valueAsNumber: true })}
              className={cn({ "border-red-500": errors.quantity })}
            />
          </div>
        </div>

        {/* chassis no. */}
        {quantity > 0 && (
          <ScrollArea className="h-96">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Chassis Numbers</h3>
              <div className="space-y-4">
                {Array.from({ length: quantity }, (_, index) => (
                  <div
                    key={index}
                    className="border-input grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 rounded-lg border p-4"
                  >
                    <div className="space-y-2">
                      <Label>Chassis #{index + 1}</Label>
                      <Input
                        type="text"
                        {...register(`chassis_numbers.${index}.number`)}
                        placeholder={`Enter chassis number ${index + 1}`}
                        className={cn({
                          "border-red-500":
                            errors?.chassis_numbers?.[index]?.number,
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Motor No.</Label>
                      <Input
                        type="text"
                        {...register(`chassis_numbers.${index}.motor_no`)}
                        placeholder="Enter motor number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Battery No.</Label>
                      <Input
                        type="text"
                        {...register(`chassis_numbers.${index}.battery_no`)}
                        placeholder="Enter battery number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Controller No.</Label>
                      <Input
                        type="text"
                        {...register(`chassis_numbers.${index}.controller_no`)}
                        placeholder="Enter controller number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Charger No.</Label>
                      <Input
                        type="text"
                        {...register(`chassis_numbers.${index}.charger_no`)}
                        placeholder="Enter charger number"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        )}

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
