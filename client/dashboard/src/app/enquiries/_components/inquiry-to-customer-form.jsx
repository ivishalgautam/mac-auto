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
import { convertInquiryToCustomer } from "@/services/enquiry";
import { z } from "zod";
import DealerSelect from "@/features/dealer-select";
import { useAuth } from "@/providers/auth-provider";

const schema = z.object({
  dealer_id: z.string().uuid().or(z.literal("")).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function InquiryToCustomerForm({ onSuccess, inquiryId }) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      username: "",
      password: "",
      dealer_id: "",
    },
  });
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (data) => convertInquiryToCustomer(inquiryId, data),
    onSuccess: () => {
      toast.success("Converted to customer.");
      queryClient.invalidateQueries(["enquiries"]);
      typeof onSuccess === "function" && onSuccess();
    },
    onError: (error) => {
      console.log({ error });
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
        {/* dealer id */}
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

        {/* username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            type="username"
            placeholder="Enter your username"
            {...register("username")}
            className={cn({ "border-red-500": errors.username })}
          />
        </div>

        {/* password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            placeholder="Enter your password"
            {...register("password")}
            className={cn({ "border-red-500": errors.password })}
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
