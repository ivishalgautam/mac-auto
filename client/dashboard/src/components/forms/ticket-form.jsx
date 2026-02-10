"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ExternalLink,
  EyeIcon,
  LoaderCircleIcon,
  XIcon,
} from "lucide-react";
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
import { Input } from "../ui/input";
import { ROLES } from "@/data/routes";
import CustomMultiSelect from "../custom-multi-select";
import { useFormattedParts } from "@/mutations/use-parts";

const defaultValues = {
  images: [],
  expected_closure_date: null,
  assigned_technician: null,
  assigned_manager: null,
  parts: [],
  part_ids: [],
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
    videos: [],
  });
  const [fileUrls, setFileUrls] = useState({
    images_urls: [],
    videos_urls: [],
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
  const {
    data: parts,
    isLoading: isPartsLoading,
    isError: isPartsError,
    error: partsError,
  } = useFormattedParts(id);

  const { data, isLoading, isError, error } = useGetTicket(id);
  const onSubmit = (data) => {
    const formData = new FormData();
    files.images?.forEach((file) => {
      formData.append("images", file);
    });
    files.videos?.forEach((file) => {
      formData.append("videos", file);
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
    if (["edit", "view"].includes(type) && data && parts) {
      setFileUrls((prev) => ({
        ...prev,
        images_urls: data.images,
        videos_urls: data.videos,
      }));
      reset({
        ...data,
        part_ids: parts?.filter((p) => data.part_ids.includes(p.value)),
      });
    }
  }, [data, type, reset, parts]);

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

          {/* Videos */}
          <div className="col-span-full space-y-4">
            <Label>Videos</Label>
            <Input
              type="file"
              multiple
              onChange={(e) =>
                setFiles((prev) => ({
                  ...prev,
                  videos: Array.from(e.target.files),
                }))
              }
              accept="video/*"
            />
            <div className="flex flex-wrap items-center justify-start gap-2">
              {fileUrls?.videos_urls?.map((file, index) => (
                <div
                  key={index}
                  className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <a href={`${config.file_base}/${file}`} target="_blank">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate">{file.split("\\").pop()}</span>
                    </div>
                  </a>
                  <Button
                    onClick={() =>
                      setFileUrls((prev) => ({
                        ...prev,
                        videos_urls: prev.videos_urls.filter((i) => i !== file),
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

          {/* warranty detail */}
          <div className="space-y-2">
            <Label htmlFor="complaint_type">Warranty *</Label>
            <Controller
              name="warranty_detail"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  onChange={field.onChange}
                  value={field.value}
                  placeholder="Select warranty"
                  className={cn({
                    "border border-red-500 dark:border-red-500":
                      errors.warranty_detail,
                  })}
                  disabled={type === "view"}
                  key={"warranty_detail"}
                  options={[
                    {
                      value: "Under warranty",
                      label: "Under warranty",
                    },
                    {
                      value: "Not in warranty",
                      label: "Not in warranty",
                    },
                  ]}
                />
              )}
            />
          </div>

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
            <Label htmlFor="message">Customer observation *</Label>
            <Textarea
              id="message"
              {...register("message")}
              className={cn({ "border-red-500": errors.message })}
              placeholder="Enter observation"
              disabled={type === "view"}
            />
          </div>

          {/* mac message */}
          {["admin", "cre", "manager"].includes(user?.role) && (
            <div className="col-span-full space-y-2">
              <Label htmlFor="mac_message">Mac observation *</Label>
              <Textarea
                id="mac_message"
                {...register("mac_message")}
                className={cn({ "border-red-500": errors.mac_message })}
                placeholder="Enter observation"
                disabled={type === "view"}
              />
            </div>
          )}

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
          {[ROLES.ADMIN, ROLES.MANAGER, ROLES.DEALER].includes(user?.role) && (
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
            <>
              {/* Parts */}
              <div className="col-span-full space-y-2">
                <Label htmlFor="part_ids">Parts *</Label>
                <Controller
                  name="part_ids"
                  control={control}
                  render={({ field }) => (
                    <CustomMultiSelect
                      onChange={field.onChange}
                      value={field.value}
                      placeholder="Select parts"
                      className={cn({
                        "border border-red-500 dark:border-red-500":
                          errors.part_ids,
                      })}
                      disabled={type === "view"}
                      key={"part_ids"}
                      options={parts}
                      isLoading={isPartsLoading}
                      isError={isPartsError}
                      error={partsError}
                    />
                  )}
                />
              </div>
            </>
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
