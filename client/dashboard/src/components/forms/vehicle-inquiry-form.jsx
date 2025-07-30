"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import PhoneSelect from "../ui/phone-input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useRouter } from "next/navigation";
import VehicleSelect from "@/features/vehicle-select";
import { vehicleInquirySchema } from "@/utils/schema/vehicle-inquiry.schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEnquiry } from "@/services/enquiry";

export default function VehicleInquiryForm({ onSuccess }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(vehicleInquirySchema),
    defaultValues: {
      vehicle_id: "",
      quantity: 1,
      message: "",
      name: "",
      email: "",
      phone: "",
      location: "",
    },
  });
  const queryClient = useQueryClient();
  const router = useRouter();
  const createMutation = useMutation({
    mutationFn: createEnquiry,
    onSuccess: () => {
      toast.success("Enquiry created.");
      queryClient.invalidateQueries(["enquiries"]);
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message ?? error?.message ?? "error");
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = createMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Vehicle ID (Hidden field if passed as prop) */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="vehicle_id">Vehicle ID *</Label>
          <Controller
            name="vehicle_id"
            control={control}
            render={({ field }) => (
              <VehicleSelect
                value={field.value}
                onChange={field.onChange}
                className={cn({
                  "border-red-500 dark:border-red-500": errors.vehicle_id,
                })}
              />
            )}
          />
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="Enter your full name"
            {...register("name")}
            className={cn({ "border-red-500": errors.name })}
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            className={cn({ "border-red-500": errors.email })}
          />
        </div>

        {/* Phone */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <PhoneSelect
                value={field.value}
                onChange={field.onChange}
                placeholder="Enter your phone number"
                className={cn({
                  "border border-red-500": errors.phone,
                })}
              />
            )}
          />
        </div>

        {/* Location */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="Enter your location"
            {...register("location")}
            className={cn({ "border-red-500": errors.location })}
          />
        </div>

        {/* Quantity */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            placeholder="Enter quantity"
            {...register("quantity", { valueAsNumber: true })}
            className={cn({ "border-red-500": errors.quantity })}
          />
        </div>

        {/* Message */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            placeholder="Enter your message or inquiry details"
            rows={4}
            {...register("message")}
            className={cn({ "border-red-500": errors.message })}
          />
        </div>
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
          className="w-full sm:w-auto"
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
