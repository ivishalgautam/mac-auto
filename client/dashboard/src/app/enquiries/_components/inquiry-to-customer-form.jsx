"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createExistingCustomerOrder,
  createNewCustomerOrder,
} from "@/services/enquiry";
import { z } from "zod";
import DealerSelect from "@/features/dealer-select";
import { useAuth } from "@/providers/auth-provider";
import { useGetUserByPhone } from "@/mutations/user-mutation";
import Loader from "@/components/loader";
import moment from "moment";
import { Muted, P } from "@/components/ui/typography";
import { useEffect, useState } from "react";
import PhoneSelect from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import DealerVehicleColorSelect from "@/features/dealer-vehicle-color-select";
import ChassisSelectByColor from "@/features/chassis-select-by-color";
import { Separator } from "@/components/ui/separator";

const newCustomerOrderSchema = z
  .object({
    dealer_id: z.string().uuid().or(z.literal("")).optional(),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: "Username can only contain letters, numbers, and underscores",
      }),
    password: z.string().min(8, "Password must be at least 8 characters"),
    mobile_number: z
      .string({ required_error: "Mobile number is required." })
      .min(1, { message: "Mobile number is required." }),

    vehicle_color_id: z
      .string()
      .uuid({ message: "Select valid vehicle color" }),
    chassis_no: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .min(1, { message: "Chassis No. is required*" })
      .transform((data) => data[0].value),
    booking_amount: z
      .number()
      .min(1, { message: "Booking amount is required." }),
  })
  .refine((data) => isValidPhoneNumber(data.mobile_number), {
    path: ["mobile_number"],
    message: "Invalid phone number",
  });

const existingCustomerOrderSchema = z.object({
  dealer_id: z.string().uuid().or(z.literal("")).optional(),
  vehicle_color_id: z.string().uuid({ message: "Select valid vehicle color" }),
  chassis_no: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .min(1, { message: "Chassis No. is required*" })
    .transform((data) => data[0].value),
  booking_amount: z.number().min(1, { message: "Booking amount is required." }),
});

export default function InquiryToCustomerForm({
  onSuccess,
  inquiryId,
  selectedEnq = {},
}) {
  // console.log({ selectedEnq });
  const phoneNumber = selectedEnq?.phone;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: existingUser, isLoading: checkingUser } =
    useGetUserByPhone(phoneNumber);

  // Decide mode: existing or new customer order
  const [isExistingCustomerOrder, setIsExistingCustomerOrder] = useState(true);

  // Reset when user lookup finishes
  useEffect(() => {
    if (existingUser) {
      setIsExistingCustomerOrder(true);
    } else {
      setIsExistingCustomerOrder(false);
    }
  }, [existingUser]);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(
      isExistingCustomerOrder
        ? existingCustomerOrderSchema
        : newCustomerOrderSchema,
    ),
    defaultValues: {
      username: "",
      password: "",
      dealer_id: "",
      mobile_number: selectedEnq?.phone ?? "",
    },
  });

  // Mutation for new customer
  const createMutation = useMutation({
    mutationFn: (data) => createNewCustomerOrder(inquiryId, data),
    onSuccess: () => {
      toast.success("Created new customer and order.");
      queryClient.invalidateQueries(["enquiries"]);
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ??
          error?.message ??
          "Error creating customer",
      );
    },
  });

  // Mutation for existing customer
  const linkMutation = useMutation({
    mutationFn: (data) => createExistingCustomerOrder(inquiryId, data),
    onSuccess: () => {
      toast.success("Created order for existing customer.");
      queryClient.invalidateQueries(["enquiries"]);
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ??
          error?.message ??
          "Error linking order",
      );
    },
  });

  const onSubmit = (data) => {
    if (isExistingCustomerOrder && existingUser) {
      linkMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = createMutation.isPending || linkMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* dealer id (only admin can choose) */}
        {user?.role === "admin" && (
          <div className="col-span-full space-y-2">
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
        )}

        {checkingUser ? (
          <Loader />
        ) : (
          <>
            <div className="col-span-full grid gap-4 md:grid-cols-2">
              {/* vehicle color id */}
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Controller
                  name="vehicle_color_id"
                  control={control}
                  render={({ field }) => (
                    <DealerVehicleColorSelect
                      value={field.value}
                      onChange={field.onChange}
                      className={cn({
                        "border-red-500 dark:border-red-500":
                          errors.vehicle_color_id,
                      })}
                      vehicleId={selectedEnq.vehicle_id}
                    />
                  )}
                />
              </div>

              {/* chassis */}
              <div className="space-y-2">
                <Label>Chassis</Label>
                <Controller
                  name="chassis_no"
                  control={control}
                  render={({ field }) => (
                    <ChassisSelectByColor
                      vehicleColorId={watch("vehicle_color_id")}
                      value={field.value}
                      onChange={field.onChange}
                      className={cn({
                        "border-red-500 dark:border-red-500": errors.chassis_no,
                      })}
                      maxSelected={1}
                      onMaxSelected={(maxLimit) => {
                        toast.warning(
                          `You have reached max selected: ${maxLimit}`,
                        );
                      }}
                    />
                  )}
                />
              </div>

              {/* booking amt */}
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
            </div>

            {isExistingCustomerOrder && existingUser ? (
              // Case 1: existing user
              <div className="col-span-full">
                <div className="space-y-6">
                  <P>This phone number already belongs to</P>
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <strong>Username: </strong>
                      <Muted>{existingUser.username}</Muted>
                    </div>
                    <div>
                      <strong>Full Name: </strong>
                      <Muted>
                        {existingUser.first_name} {existingUser.last_name ?? ""}
                      </Muted>
                    </div>
                    <div>
                      <strong>Email: </strong>
                      <Muted>{existingUser.email}</Muted>
                    </div>
                    <div>
                      <strong>Registered On: </strong>
                      <Muted>
                        {moment(existingUser.created_at).format("DD/MM/YYYY")}
                      </Muted>
                    </div>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Submitting will create order against this customer.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            ) : (
              // Case 2: new customer
              <>
                <Separator className="col-span-full" />

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    {...register("username")}
                    className={cn({ "border-red-500": errors.username })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    {...register("password")}
                    className={cn({ "border-red-500": errors.password })}
                  />
                </div>

                {(existingUser || !isExistingCustomerOrder) && (
                  <div className="col-span-full space-y-2">
                    <Label htmlFor="mobile_number">Mobile Number *</Label>
                    <Controller
                      control={control}
                      name="mobile_number"
                      render={({ field }) => (
                        <PhoneSelect
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter your mobile number"
                          className={cn({
                            "border border-red-500": errors.mobile_number,
                          })}
                        />
                      )}
                    />
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Form Errors */}
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

      {/* Actions */}
      <div className="flex justify-end gap-2">
        {existingUser && (
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsExistingCustomerOrder(false);
              reset(); // reset form fields for new customer
            }}
          >
            Create New Customer
          </Button>
        )}

        <Button
          type="submit"
          disabled={isFormPending || (!isDirty && !existingUser)}
        >
          {isFormPending && (
            <LoaderCircleIcon
              className="-ms-1 animate-spin"
              size={16}
              aria-hidden="true"
            />
          )}
          {"Create Order"}
        </Button>
      </div>
    </form>
  );
}
