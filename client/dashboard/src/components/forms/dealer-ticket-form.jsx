"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useEffect } from "react";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { dealerTicketSchema } from "@/utils/schema/ticket.schema";
import { useAuth } from "@/providers/auth-provider";
import CustomSelect from "../ui/custom-select";
import { dealerComplaintTypes } from "@/data";
import { DatePicker } from "../ui/date-picker";
import {
  useCreateDealerTicket,
  useGetDealerTicket,
  useUpdateDealerTicket,
} from "@/mutations/dealer-ticket-mutation";
import UserSelect from "@/features/user-select";

const defaultValues = {
  assigned_technician: "",
  message: "",
  expected_closure_date: null,
};

export default function DealerTicketForm({ id, type }) {
  const { user } = useAuth();
  const router = useRouter();
  const methods = useForm({
    resolver: zodResolver(dealerTicketSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    control,
  } = methods;

  const createMutation = useCreateDealerTicket(() => {
    reset();
    router.push("/dealer-tickets?page=1&limit=10");
  });
  const updateMutation = useUpdateDealerTicket(id, () => {
    reset();
    router.push("/dealer-tickets?page=1&limit=10");
  });
  const { data, isLoading, isError, error } = useGetDealerTicket(id);
  const onSubmit = (data) => {
    type === "create"
      ? createMutation.mutate(data)
      : updateMutation.mutate(data);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  useEffect(() => {
    if (["edit", "view"].includes(type) && data) {
      reset({ ...data });
    }
  }, [data, type, reset]);

  if (["edit", "view"].includes(type) && isLoading) return <Loader />;
  if (["edit", "view"].includes(type) && isError)
    return <ErrorMessage error={error} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-3 gap-4">
          {/* complaint type */}
          <div className="space-y-2">
            <Label htmlFor="complaint_type">Complaint type *</Label>
            <Controller
              name="complaint_type"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  onChange={field.onChange}
                  value={field.value}
                  placeholder="Select complaint"
                  className=""
                  disabled={type === "view"}
                  key={"complaint_type"}
                  options={dealerComplaintTypes}
                />
              )}
            />
          </div>

          {/* message */}
          <div className="col-span-full space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              {...register("message")}
              className={cn({ "border-red-500": errors.message })}
              placeholder="Enter message"
              disabled={type === "view"}
            />
          </div>

          {/* expected closure date */}
          {["admin", "cre", "manager"].includes(user?.role) && (
            <div>
              <Label>Expected closure date</Label>
              <div>
                <Controller
                  name="expected_closure_date"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      onChange={field.onChange}
                      value={field.value}
                      disabled={type === "view"}
                    />
                  )}
                />
              </div>
            </div>
          )}

          {/* assigned manager */}
          {["cre"].includes(user?.role) && (
            <div className="space-y-2">
              <Label htmlFor="assigned_manager">Manager</Label>
              <Controller
                name="assigned_manager"
                control={control}
                render={({ field }) => (
                  <UserSelect
                    onChange={field.onChange}
                    value={field.value}
                    role="manager"
                  />
                )}
              />
            </div>
          )}
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

        {["create", "edit"].includes(type) && (
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
        )}
      </form>
    </FormProvider>
  );
}
