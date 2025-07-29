"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userFormSchema, userUpdateSchema } from "@/utils/schema/register";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, LoaderCircleIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import PhoneSelect from "../ui/phone-input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { useCreateUser, useGetUser } from "@/mutations/user-mutation";
import { useUpdateUser } from "../../mutations/user-mutation";
import { getFormErrors } from "@/lib/get-form-errors";
import { useEffect } from "react";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { useRouter } from "next/navigation";

export default function UserForm({ id, type }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(
      type === "create" ? userFormSchema : userUpdateSchema,
    ),
    defaultValues: {
      username: "",
      email: "",
      mobile_number: "",
      first_name: "",
      last_name: "",
      password: "",
      role: "",
    },
  });
  const router = useRouter();

  const role = watch("role");
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(id, function () {
    router.back();
  });
  const { data, isLoading, isError, error } = useGetUser(id);

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
    if (type === "edit" && data) {
      reset({
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        mobile_number: data.mobile_number || "",
        role: data.role || "",
        username: data.username || "",
        location: data.location || "",
      });
    }
  }, [data, type, reset]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Role */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => {
              return (
                <Select
                  key={field.value}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger
                    className={cn("w-full", { "border-red-500": errors.role })}
                    id="role"
                  >
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              );
            }}
          />
        </div>

        {/* location */}
        {role === "dealer" && (
          <div className="col-span-full space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              placeholder="Enter Dealer Location"
              {...register("location")}
              className={cn({ "border-red-500": errors.location })}
            />
          </div>
        )}

        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input
            id="first_name"
            placeholder="Enter your first name"
            {...register("first_name")}
            className={cn({ "border-red-500": errors.first_name })}
          />
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input
            id="last_name"
            placeholder="Enter your last name"
            {...register("last_name")}
            className={cn({ "border-red-500": errors.last_name })}
          />
        </div>

        {/* Mobile Number */}
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

        {/* Email */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="text"
            placeholder="Enter your email"
            {...register("email")}
            className={cn({ "border-red-500": errors.email })}
          />
        </div>

        {/* Username */}
        <div className="space-y-2">
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            placeholder="Enter your username"
            {...register("username")}
            className={cn({ "border-red-500": errors.username })}
          />
        </div>

        {/* Password */}
        {type === "create" && (
          <div className="relative space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={cn("pr-10", {
                  "border-red-500": errors.password,
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}

        {/* Confirm Password */}
        {type === "create" && (
          <div className="relative space-y-2">
            <Label htmlFor="confirm_password">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirm_password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                {...register("confirm_password")}
                className={cn("pr-10", {
                  "border-red-500 pr-10": errors.confirm_password,
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-600"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}
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
