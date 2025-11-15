"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ExternalLink, LoaderCircleIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import z from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import PhoneSelect from "../ui/phone-input";
import { useCallback, useEffect, useState } from "react";
import config from "@/config";
import { useOrder } from "@/mutations/use-orders";
import Loader from "../loader";
import ErrorMessage from "../ui/error";

export const schema = z
  .object({
    driver_details: z.object({
      driver_name: z
        .string({
          required_error: "Driver name is required",
        })
        .min(2, "Driver name must be at least 2 characters long")
        .max(50, "Driver name must be less than 50 characters"),
      vehicle_number: z
        .string({
          required_error: "Vehicle number is required",
        })
        .regex(
          /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{3,4}$/i,
          "Enter a valid vehicle number (e.g., MH12AB1234)",
        ),
      phone: z
        .string({ required_error: "Phone is required." })
        .min(1, { message: "Phone is required." }),
    }),

    status: z.string({
      required_error: "Status is required",
    }),
  })
  .refine((data) => isValidPhoneNumber(data.driver_details.phone), {
    path: ["driver_details", "phone"],
    message: "Invalid phone number",
  });

const defaultValues = {
  driver_details: {
    driver_name: "",
    vehicle_number: "",
    phone: "",
  },
  status: "out for delivery",
};

export default function DriverForm({ type = "create", updateMutation, id }) {
  const [files, setFiles] = useState({
    invoice: [],
    pdi: [],
    e_way_bill: [],
  });
  const [fileUrls, setFileUrls] = useState({
    invoice_urls: [],
    pdi_urls: [],
    e_way_bill_urls: [],
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    control,
    setError,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const { data, isLoading, isError, error } = useOrder(id);

  const onSubmit = (data) => {
    //     invoice
    // pdi
    // e_way_bill
    if (!fileUrls?.invoice_urls?.length && !files.invoice.length) {
      return setError("invoice", {
        type: "manual",
        message: "Atleat 1 Invoice is required*",
      });
    }
    if (!fileUrls?.pdi_urls?.length && !files.pdi.length) {
      return setError("pdi", {
        type: "manual",
        message: "Atleat 1 PDI is required*",
      });
    }
    if (!fileUrls?.e_way_bill_urls?.length && !files.e_way_bill.length) {
      return setError("e_way_bill", {
        type: "manual",
        message: "Atleat 1 E-Way Bill is required*",
      });
    }

    const formData = new FormData();

    Object.entries(files).forEach(([key, files]) => {
      files.forEach((file) => {
        formData.append(key, file);
      });
    });

    Object.entries(fileUrls).forEach(([key, value]) => {
      formData.append(key, JSON.stringify(value));
    });

    Object.entries(data).forEach(([key, value]) => {
      typeof value === "object"
        ? formData.append(key, JSON.stringify(value))
        : formData.append(key, value);
    });

    updateMutation?.mutate?.(formData);
  };

  useEffect(() => {
    if (data) {
      setFileUrls((prev) => ({
        ...prev,
        invoice_urls: data?.invoice ?? [],
        pdi_urls: data?.pdi ?? [],
        e_way_bill_urls: data?.e_way_bill ?? [],
      }));
      reset({
        status: "out for delivery",
        driver_details: data?.driver_details,
      });
    }
  }, [data, reset]);

  const isSubmitting = updateMutation?.isPending || false;

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* marketing materials */}
        <div className="col-span-full space-y-4">
          <Label>Invoice *</Label>
          <Input
            type="file"
            multiple
            onChange={(e) =>
              setFiles((prev) => ({
                ...prev,
                invoice: Array.from(e.target.files),
              }))
            }
            className={cn({ "border-destructive": errors.invoice })}
          />
          <div className="flex flex-wrap items-center justify-start gap-2">
            {fileUrls?.invoice_urls?.map((file, index) => (
              <div
                key={index}
                className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <a href={`${config.file_base}/${file}`} target="_blank">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <span className="truncate">{file.split("\\").pop()}</span>
                </div>
                <Button
                  onClick={() =>
                    setFileUrls((prev) => ({
                      ...prev,
                      invoice_urls: prev.invoice_urls.filter((i) => i !== file),
                    }))
                  }
                  size="icon"
                  className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                  aria-label="Remove image"
                  type="button"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* pdi */}
        <div className="col-span-full space-y-4">
          <Label>PDI *</Label>
          <Input
            type="file"
            multiple
            onChange={(e) =>
              setFiles((prev) => ({
                ...prev,
                pdi: Array.from(e.target.files),
              }))
            }
            className={cn({ "border-destructive": errors.pdi })}
          />
          <div className="flex flex-wrap items-center justify-start gap-2">
            {fileUrls?.pdi_urls?.map((file, index) => (
              <div
                key={index}
                className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <a>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <span className="truncate">{file.split("\\").pop()}</span>
                </div>
                <Button
                  onClick={() =>
                    setFileUrls((prev) => ({
                      ...prev,
                      pdi_urls: prev.pdi_urls.filter((i) => i !== file),
                    }))
                  }
                  size="icon"
                  className="border-background focus-visible:border-background absolute -top-2 -right-2 size-6 rounded-full border-2 shadow-none"
                  aria-label="Remove image"
                  type="button"
                >
                  <XIcon className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* pdi */}
        <div className="col-span-full space-y-4">
          <Label>E-Way Bill *</Label>
          <Input
            type="file"
            multiple
            onChange={(e) =>
              setFiles((prev) => ({
                ...prev,
                e_way_bill: Array.from(e.target.files),
              }))
            }
            className={cn({ "border-destructive": errors.e_way_bill })}
          />
          <div className="flex flex-wrap items-center justify-start gap-2">
            {fileUrls?.e_way_bill_urls?.map((file, index) => (
              <div
                key={index}
                className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  <a>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <span className="truncate">{file.split("\\").pop()}</span>
                </div>
                <Button
                  onClick={() =>
                    setFileUrls((prev) => ({
                      ...prev,
                      e_way_bill_urls: prev.e_way_bill_urls.filter(
                        (i) => i !== file,
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
              </div>
            ))}
          </div>
        </div>

        {/* Driver Name */}
        <div className="space-y-2">
          <Label htmlFor="driver_details.driver_name">Driver Name *</Label>
          <Input
            id="driver_details.driver_name"
            placeholder="Enter driver name"
            {...register("driver_details.driver_name")}
            className={cn({
              "border-destructive": errors.driver_details?.driver_name,
            })}
          />
          {errors.driver_details?.driver_name && (
            <span className="text-destructive text-sm">
              {errors.driver_details?.driver_name.message}
            </span>
          )}
        </div>

        {/* Vehicle Number */}
        <div className="space-y-2">
          <Label htmlFor="driver_details.vehicle_number">
            Vehicle Number *
          </Label>
          <Input
            id="driver_details.vehicle_number"
            placeholder="Enter vehicle number"
            {...register("driver_details.vehicle_number")}
            className={cn({
              "border-destructive": errors.driver_details?.vehicle_number,
            })}
          />
          {errors.driver_details?.vehicle_number && (
            <span className="text-destructive text-sm">
              {errors.driver_details?.vehicle_number.message}
            </span>
          )}
        </div>

        {/* Phone */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="driver_details.phone">Phone *</Label>
          <Controller
            control={control}
            name="driver_details.phone"
            render={({ field }) => (
              <PhoneSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter phone number"
                className={cn({
                  "border-destructive": errors.driver_details?.phone,
                })}
              />
            )}
          />
          {errors.driver_details?.phone && (
            <span className="text-destructive text-sm">
              {errors.driver_details?.phone.message}
            </span>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="text-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting && (
            <LoaderCircleIcon
              className="-ms-1 animate-spin"
              size={16}
              aria-hidden="true"
            />
          )}
          {type === "create" ? "Add Driver" : "Update Driver"}
        </Button>
      </div>
    </form>
  );
}
