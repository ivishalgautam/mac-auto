"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useEffect } from "react";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { z } from "zod";
import {
  useGetInventoryItem,
  useUpdateInventory,
} from "@/mutations/inventory.mutation";

const schema = z.object({
  chassis_no: z.string().min(1, { message: "Chassis No. is required*" }),
});

export default function InventoryItemForm({ id, callback = null }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { chassis_no: "" },
  });

  const updateMutation = useUpdateInventory(id, callback);
  const { data, isLoading, isError, error } = useGetInventoryItem(id);

  const onSubmit = (data) => {
    updateMutation.mutate(data);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = updateMutation.isPending;

  useEffect(() => {
    if (data) {
      reset({ chassis_no: data.chassis_no || "" });
    }
  }, [data, id, reset]);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* chassis_no */}
      <div className="col-span-full space-y-2">
        <Label htmlFor="chassis_no">Chassis No. *</Label>
        <Input
          id="chassis_no"
          placeholder="Enter Chassis No."
          {...register("chassis_no")}
          className={cn({ "border-red-500": errors.chassis_no })}
        />
      </div>

      {/* Form Errors Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="mb-2 font-medium">
              Please fix the following errors:
            </div>
            <ul className="list-inside list-disc space-y-1">
              {formErrors.map((error, index) => (
                <li key={index} className="text-sm">
                  {error}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="text-end">
        <Button
          type="submit"
          disabled={isFormPending || !isDirty}
          className={"w-full sm:w-auto"}
        >
          {isFormPending && (
            <LoaderCircleIcon
              className="-ms-1 animate-spin"
              size={16}
              aria-hidden="true"
            />
          )}
          Submit
        </Button>
      </div>
    </form>
  );
}
