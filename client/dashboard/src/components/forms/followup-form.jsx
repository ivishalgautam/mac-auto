"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { z } from "zod";
import {
  useCreateFollowUp,
  useGetFollowup,
  useUpdateFollowUp,
} from "@/mutations/followup-mutation";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { useEffect } from "react";

const schema = z.object({
  enquiry_id: z.string().uuid(),
  message: z.string().min(3, { message: "Message is required" }),
});

export default function FollowUpForm({
  type = "create",
  enquiryId,
  onSuccess,
  id,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      enquiry_id: enquiryId ?? "",
      message: "",
    },
  });

  const { data, isLoading, isError, error } = useGetFollowup(id);
  const createMutation = useCreateFollowUp(onSuccess);
  const updateMutation = useUpdateFollowUp(onSuccess);
  console.log({ type, data });
  const onSubmit = (data) => {
    type === "create"
      ? createMutation.mutate(data)
      : updateMutation.mutate(data);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending = createMutation.isPending;

  useEffect(() => {
    if (type === "edit" && data) {
      console.log({ data });
      reset({ message: data?.message ?? "" });
    }
  }, [type, data, id, reset]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Enter your message or inquiry details"
          rows={4}
          {...register("message")}
          className={cn({ "border-red-500": errors.message })}
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
