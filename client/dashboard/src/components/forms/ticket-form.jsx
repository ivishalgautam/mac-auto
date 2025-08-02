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
  adminTicketSchema,
  customerTicketSchema,
  dealerTicketSchema,
  ticketSchema,
} from "@/utils/schema/ticket.schema";
import {
  useCreateTicket,
  useGetTicket,
  useUpdateTicket,
} from "@/mutations/ticket-mutation";
import CustomerSelect from "@/features/customer-select";
import { useAuth } from "@/providers/auth-provider";
import { useGetFormattedPurchasesByCustomer } from "@/mutations/customer-mutation";
import CustomerPurchaseSelect from "@/features/customer-purchase-select";

const defaultValues = {
  images: [],
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
    resolver: zodResolver(
      user?.role === "customer" ? customerTicketSchema : ticketSchema,
    ),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setError,
    control,
    watch,
    setValue,
  } = methods;

  const customerId = watch("customer_id");
  console.log({ customerId });
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
    if (!fileUrls?.images_urls?.length && !files.images.length) {
      return setError("images", {
        type: "manual",
        message: "Atleat 1 images is required*",
      });
    }

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
  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;
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
          {user?.role !== "customer" && type === "create" && (
            <div className="space-y-2">
              <Label htmlFor="customer_id">Customer ID *</Label>
              <Controller
                name="customer_id"
                control={control}
                render={({ field }) => (
                  <CustomerSelect
                    onChange={(selected) => {
                      field.onChange(selected);
                      setValue("purchase_id", "");
                    }}
                    value={field.value}
                  />
                )}
              />
            </div>
          )}

          {/* purchase_id */}
          {((customerId && user?.role === "admin" && type === "create") ||
            user?.role === "customer") && (
            <div className="space-y-2">
              <Label htmlFor="purchase_id">Purchase ID *</Label>
              <Controller
                name="purchase_id"
                control={control}
                render={({ field }) => (
                  <CustomerPurchaseSelect
                    onChange={field.onChange}
                    value={field.value}
                    customerId={customerId}
                  />
                )}
              />
            </div>
          )}

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
