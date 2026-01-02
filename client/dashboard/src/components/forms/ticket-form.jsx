"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, EyeIcon, LoaderCircleIcon, XIcon } from "lucide-react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useEffect } from "react";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/file-uploader";
import { useState } from "react";
import Image from "next/image";
import config from "@/config";
import { useCallback } from "react";
import {
  creTicketSchema,
  customerTicketSchema,
  ticketSchema,
} from "@/utils/schema/ticket.schema";
import {
  useCreateTicket,
  useGetTicket,
  useUpdateTicket,
} from "@/mutations/ticket-mutation";
import { useAuth } from "@/providers/auth-provider";
import CustomSelect from "../ui/custom-select";
import { customerComplaintTypes } from "@/data";
import { DatePicker } from "../ui/date-picker";
import TagInput from "../tag-input";
import TechnicianSelect from "@/features/technician-select";
import UserSelect from "@/features/user-select";

const defaultValues = {
  images: [],
  expected_closure_date: null,
  assigned_technician: null,
  assigned_manager: null,
  parts: [],
};

const schemaByRole = {
  customer: customerTicketSchema,
  cre: creTicketSchema,
  admin: ticketSchema,
};

export default function TicketForm({ id, type }) {
  const { user } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState({
    images: [],
  });
  const [fileUrls, setFileUrls] = useState({
    images_urls: [],
  });
  const methods = useForm({
    resolver: zodResolver(schemaByRole[user?.role] ?? ticketSchema),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    watch,
  } = methods;
  const isPartsRelated = watch("complaint_type") === "Spare Parts Related";

  const createMutation = useCreateTicket(() => {
    reset();
    router.push("/tickets?page=1&limit=10");
  });
  const updateMutation = useUpdateTicket(id, () => {
    reset();
    router.push("/tickets?page=1&limit=10");
  });
  const { data, isLoading, isError, error } = useGetTicket(id);
  const onSubmit = (data) => {
    const formData = new FormData();
    files.images?.forEach((file) => {
      formData.append("images", file);
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
    if (["edit", "view"].includes(type) && data) {
      setFileUrls((prev) => ({
        ...prev,
        images_urls: data.images,
      }));
      reset({ ...data });
    }
  }, [data, type, reset]);

  const handleImagesChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, images: data }));
  }, []);

  if (["edit", "view"].includes(type) && isLoading) return <Loader />;
  if (["edit", "view"].includes(type) && isError)
    return <ErrorMessage error={error} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-3 gap-4">
          {/* images */}
          <div className="col-span-full space-y-4">
            <Label>Images</Label>
            {["create", "edit"].includes(type) && (
              <FileUpload
                onFileChange={handleImagesChange}
                inputName={"images"}
                className={cn({ "border-red-500": errors.images })}
                initialFiles={[]}
                multiple={true}
                maxFiles={50}
              />
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
              {fileUrls.images_urls?.map((src, index) => (
                <div
                  className="bg-accent group relative aspect-square w-24 rounded-md"
                  key={index}
                >
                  <Image
                    src={`${config.file_base}/${src}`}
                    width={200}
                    height={200}
                    className="size-full rounded-[inherit] object-cover"
                    alt={`carousel-${index}`}
                  />
                  {type === "edit" && (
                    <Button
                      onClick={() =>
                        setFileUrls((prev) => ({
                          ...prev,
                          images_urls: prev.images_urls.filter(
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

                  <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <a
                      target="_blank"
                      className={buttonVariants({
                        size: "icon",
                        variant: "ghost",
                      })}
                      href={`${config.file_base}/${src}`}
                    >
                      <EyeIcon className="size-5 text-white" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* customer_id */}
          {user && user.role !== "customer" && type === "create" && (
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer ID *</Label>
              <Controller
                name="customer_id"
                control={control}
                render={({ field }) => (
                  <UserSelect
                    onChange={(selected) => {
                      field.onChange(selected);
                    }}
                    value={field.value}
                    className={cn({
                      "border border-red-500 dark:border-red-500":
                        errors.customer_id,
                    })}
                    role="customer"
                  />
                )}
              />
            </div>
          )}

          {/* assigned_cre */}
          {user && !["cre", "customer"].includes(user.role) && (
            <div className="space-y-2">
              <Label htmlFor="assigned_cre">CRE *</Label>
              <Controller
                name="assigned_cre"
                control={control}
                render={({ field }) => (
                  <UserSelect
                    onChange={(selected) => {
                      field.onChange(selected);
                    }}
                    value={field.value}
                    className={cn({
                      "border border-red-500 dark:border-red-500":
                        errors.assigned_cre,
                    })}
                    role="cre"
                  />
                )}
              />
            </div>
          )}

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
                  className={cn({
                    "border border-red-500 dark:border-red-500":
                      errors.complaint_type,
                  })}
                  disabled={type === "view"}
                  key={"complaint_type"}
                  options={customerComplaintTypes}
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

          {/* assigned technician */}
          {["manager"].includes(user?.role) && (
            <div className="space-y-2">
              <Label htmlFor="assigned_technician">Technician</Label>
              <Controller
                name="assigned_technician"
                control={control}
                render={({ field }) => (
                  <TechnicianSelect
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
            </div>
          )}

          {/* parts */}
          {isPartsRelated && (
            <div className="col-span-full space-y-1">
              <Label className="block text-sm font-medium">Parts</Label>
              <Controller
                name="parts"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Add a tag"
                    inlineTags={true}
                    inputFieldPosition="top"

                    // activeIndex, setActiveIndex
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
              disabled={isFormPending}
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
