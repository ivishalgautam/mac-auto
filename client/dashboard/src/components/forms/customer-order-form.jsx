"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon, XIcon } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { toast } from "sonner";
import CustomerSelect from "@/features/customer-select";
import { customerOrderSchema } from "@/utils/schema/customer-order.schema";
import ChassisSelectByColor from "@/features/chassis-select-by-color";
import DealerVehicleColorSelect from "@/features/dealer-vehicle-color-select";
import { useState } from "react";
import Image from "next/image";
import config from "@/config";
import { Input } from "../ui/input";
import {
  useCreateCustomerOrder,
  useUpdateCustomerOrder,
} from "@/mutations/customer-order-mutation";
import DealerVehicleVariantMapSelect from "@/features/dealer-vehicle-variant-map-select";
import ChassisSelect from "@/features/chassis-select";

export default function CustomerOrderForm({
  callback,
  vehicleId,
  customerId = null,
  maxSelect = 1,
  type = "create",
  id,
}) {
  const [files, setFiles] = useState({
    invoices_bills: [],
  });
  const [fileUrls, setFileUrls] = useState({
    invoices_bills_urls: [],
  });

  const methods = useForm({
    resolver: zodResolver(customerOrderSchema),
    defaultValues: {
      customer_id: customerId ?? "",
      vehicle_id: vehicleId,
      chassis_number: "",
      vehicle_color_id: "",
      vehicle_variant_map_id: "",
      booking_amount: 0,
    },
  });
  const {
    handleSubmit,
    formState: { errors, isDirty },
    control,
    watch,
    register,
  } = methods;

  const createMutation = useCreateCustomerOrder(() => {
    typeof callback === "function" && callback();
  });
  const updateMutation = useUpdateCustomerOrder(id, () => {
    typeof callback === "function" && callback();
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.entries(files).forEach(([key, value]) => {
      value.forEach((val) => {
        formData.append(key, val);
      });
    });

    Object.entries(data).forEach(([key, value]) => {
      typeof value === "object"
        ? formData.append(key, JSON.stringify(value))
        : formData.append(key, value);
    });

    if (type === "edit") {
      Object.entries(fileUrls).forEach(([key, value]) => {
        formData.append(key, JSON.stringify(value));
      });
    }

    type === "edit"
      ? updateMutation.mutate(formData)
      : createMutation.mutate(formData);

    createMutation.mutate(data);
  };
  const vehicleColorId = watch("vehicle_color_id");
  const vehicleVariantMapId = watch("vehicle_variant_map_id");

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = createMutation.isPending;

  const handleInvoicesChange = (e) => {
    setFiles((prev) => ({
      ...prev,
      invoices_bills: Array.from(e.target.files),
    }));
  };

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

          {/* vehicle variant id */}
          <div className="space-y-2">
            <Label>Variant</Label>
            <Controller
              name="vehicle_variant_map_id"
              control={control}
              render={({ field }) => (
                <DealerVehicleVariantMapSelect
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

          {/* Chassis No. */}
          {vehicleColorId && vehicleVariantMapId && (
            <div className="space-y-2">
              <Label>Chassis No.</Label>
              <Controller
                name="chassis_number"
                control={control}
                render={({ field }) => (
                  <ChassisSelect
                    vehicleColorId={vehicleColorId}
                    vehicleVariantMapId={vehicleVariantMapId}
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

          <div className="space-y-2">
            <Label htmlFor="booking_amount">Booking Amt *</Label>
            <Input
              id="booking_amount"
              type="number"
              placeholder="Enter booking amt"
              {...register("booking_amount", { valueAsNumber: true })}
              className={cn({ "border-red-500": errors.booking_amount })}
            />
          </div>

          {/* Invoices / Bills */}
          <div>
            <Label>Invoices/Bills</Label>
            {["edit", "create"].includes(type) && (
              <Input
                type="file"
                multiple
                onChange={handleInvoicesChange}
                accept={".pdf"}
              />
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
              {fileUrls.invoices_bills_urls?.map((src, index) => (
                <div
                  className="bg-accent relative aspect-square w-24 rounded-md"
                  key={index}
                >
                  <Image
                    src={`${config.file_base}/${src}`}
                    width={200}
                    height={200}
                    className={cn("size-full rounded-[inherit] object-cover")}
                    alt={`image-${index}`}
                  />
                  {type === "edit" && (
                    <Button
                      onClick={() =>
                        setFileUrls((prev) => ({
                          ...prev,
                          invoices_bills_urls: prev.invoices_bills_urls.filter(
                            (i) => i !== src,
                          ),
                        }))
                      }
                      size="icon"
                      className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                      aria-label="Remove image"
                      type="button"
                    >
                      <XIcon className="size-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
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
