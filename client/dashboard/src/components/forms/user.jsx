"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userFormSchema, userUpdateSchema } from "@/utils/schema/register";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react";
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
import config from "@/config";
import { useAuth } from "@/providers/auth-provider";
import { ROLES } from "@/data/routes";

export default function UserForm({ id, type, role = "" }) {
  const { user } = useAuth();

  const [files, setFiles] = useState({
    aadhaar: [],
    pan: [],
    gst: [],
  });
  const [fileUrls, setFileUrls] = useState({
    aadhaar_urls: [],
    pan_urls: [],
    gst_urls: [],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
    setError,
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
      role: role,
    },
  });
  const router = useRouter();

  const selectedRole = watch("role");
  const createMutation = useCreateUser(function () {
    router.push(
      selectedRole === "dealer"
        ? "/dealers?page=1&limit=10"
        : selectedRole === "customer"
          ? user.role === "dealer"
            ? "/customers?page=1&limit=10"
            : "/all-customers?page=1&limit=10"
          : "/users?page=1&limit=10",
    );
  });
  const updateMutation = useUpdateUser(id, function () {
    router.back();
  });
  const { data, isLoading, isError, error } = useGetUser(id);

  const onSubmit = (data) => {
    if (selectedRole === "dealer") {
      let isFileError = false;
      if (!fileUrls?.aadhaar_urls?.length && !files.aadhaar.length) {
        isFileError = true;
        setError("aadhaar", {
          type: "manual",
          message: "Aadhaar is required*",
        });
      }
      if (!fileUrls?.pan_urls?.length && !files.pan.length) {
        isFileError = true;
        setError("pan", {
          type: "manual",
          message: "PAN is required*",
        });
      }
      if (!fileUrls?.gst_urls?.length && !files.gst.length) {
        isFileError = true;
        setError("gst", {
          type: "manual",
          message: "GST is required*",
        });
      }
      if (isFileError) return;
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

    type === "create"
      ? createMutation.mutate(formData)
      : updateMutation.mutate(formData);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  useEffect(() => {
    if (type === "edit" && data) {
      selectedRole === "dealer" &&
        setFileUrls((prev) => ({
          ...prev,
          aadhaar_urls: data?.aadhaar ?? [],
          pan_urls: data?.pan ?? [],
          gst_urls: data?.gst ?? [],
        }));

      reset({
        email: data.email || "",
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        mobile_number: data.mobile_number || "",
        role: data.role || "",
        username: data.username || "",
        location: data.location || "",
        dealer_code: data.dealer_code || "",
      });
    }
  }, [data, type, reset]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Role */}
        {!role && (
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
                      className={cn("w-full", {
                        "border-red-500": errors.role,
                      })}
                      id="role"
                    >
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="admin">Admin</SelectItem> */}
                      {/* <SelectItem value="dealer">Dealer</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem> */}
                      <SelectItem value="cre">CRE</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                );
              }}
            />
          </div>
        )}

        {selectedRole === "dealer" && (
          <>
            {/* location */}
            <div className="col-span-full space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Enter Dealer Location"
                {...register("location")}
                className={cn({ "border-red-500": errors.location })}
              />
            </div>

            {/* dealer code */}
            <div className="col-span-full space-y-2">
              <Label htmlFor="dealer_code">Dealer code *</Label>
              <Input
                id="dealer_code"
                placeholder="Enter Dealer Code"
                {...register("dealer_code")}
                className={cn({ "border-red-500": errors.dealer_code })}
              />
            </div>

            {/* Aadhaar */}
            <div className="col-span-full space-y-4">
              <Label>Aadhaar *</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setFiles((prev) => ({
                    ...prev,
                    aadhaar: Array.from(e.target.files),
                  }))
                }
                className={cn({ "border-destructive": errors.aadhaar })}
              />
              <div className="flex flex-wrap items-center justify-start gap-2">
                {fileUrls?.aadhaar_urls?.map((file, index) => (
                  <div
                    key={index}
                    className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <a href={`${config.file_base}/${file}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <span className="truncate">Document {index + 1}</span>
                    </div>
                    <Button
                      onClick={() =>
                        setFileUrls((prev) => ({
                          ...prev,
                          aadhaar_urls: prev.aadhaar_urls.filter(
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

            {/* pan */}
            <div className="col-span-full space-y-4">
              <Label>PAN *</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setFiles((prev) => ({
                    ...prev,
                    pan: Array.from(e.target.files),
                  }))
                }
                className={cn({ "border-destructive": errors.pan })}
              />
              <div className="flex flex-wrap items-center justify-start gap-2">
                {fileUrls?.pan_urls?.map((file, index) => (
                  <div
                    key={index}
                    className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <a href={`${config.file_base}/${file}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <span className="truncate">Document {index + 1}</span>
                    </div>
                    <Button
                      onClick={() =>
                        setFileUrls((prev) => ({
                          ...prev,
                          pan_urls: prev.pan_urls.filter((i) => i !== file),
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

            {/* gst */}
            <div className="col-span-full space-y-4">
              <Label>GST *</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setFiles((prev) => ({
                    ...prev,
                    gst: Array.from(e.target.files),
                  }))
                }
                className={cn({ "border-destructive": errors.gst })}
              />
              <div className="flex flex-wrap items-center justify-start gap-2">
                {fileUrls?.gst_urls?.map((file, index) => (
                  <div
                    key={index}
                    className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <a href={`${config.file_base}/${file}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <span className="truncate">Document {index + 1}</span>
                    </div>
                    <Button
                      onClick={() =>
                        setFileUrls((prev) => ({
                          ...prev,
                          gst_urls: prev.gst_urls.filter((i) => i !== file),
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
          </>
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

        {selectedRole !== "customer" && (
          <>
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
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
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
          disabled={isFormPending}
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
