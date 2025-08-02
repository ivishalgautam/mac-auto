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
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import {
  useGetVehicle,
  useUpdateVehicle,
  useUpdateVehiclePrice,
} from "@/mutations/vehicle-mutation";
import { useRouter } from "next/navigation";
import { z } from "zod";

const defaultValues = {
  dealer_price: "",
};

export default function UpdateVehiclePriceForm({ id, callback }) {
  const router = useRouter();
  const methods = useForm({
    resolver: zodResolver(
      z.object({
        dealer_price: z
          .number()
          .min(1, { message: "Dealer price is required!" }),
      }),
    ),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;
  const updateMutation = useUpdateVehiclePrice(id, () => {
    reset();
    typeof callback === "function" && callback();
  });
  const { data, isLoading, isError, error } = useGetVehicle(id);
  const onSubmit = (data) => {
    updateMutation.mutate({ dealer_price: data.dealer_price });
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = updateMutation.isPending;

  useEffect(() => {
    if (data) {
      reset({ dealer_price: data?.dealer_price });
    }
  }, [data, reset]);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* dealer price */}
        <div className="space-y-2">
          <Label>Dealer price *</Label>
          <Input
            type="number"
            placeholder="Enter Dealer Price"
            {...register(`dealer_price`, { valueAsNumber: true })}
            className={cn({ "border-red-500": errors.dealer_price })}
          />
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
            disabled={isFormPending}
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
