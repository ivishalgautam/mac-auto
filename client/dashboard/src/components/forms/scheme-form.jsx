"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, LoaderCircleIcon, XIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { getFormErrors } from "@/lib/get-form-errors";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { useState, useCallback, useEffect } from "react";
import FileUpload from "../file-uploader";
import config from "@/config";
import Image from "next/image";
import {
  useCreateScheme,
  useGetScheme,
  useUpdateScheme,
} from "@/mutations/scheme-mutation";
import { Textarea } from "../ui/textarea";
import { Checkbox } from "../ui/checkbox";
import { z } from "zod";
import moment from "moment";
import { DatePicker } from "../ui/date-picker";

const defaultValues = {
  name: "",
  logo: "",
  interest_percentage: "",
  area_serve: [
    {
      state: "",
      city: [],
    },
  ],
};

export default function SchemeForm({ id, onSuccess, type = "create" }) {
  const [file, setFile] = useState([]);
  const [fileUrl, setFileUrl] = useState([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
    setValue,
    setError,
  } = useForm({
    resolver: zodResolver(
      z.object({
        message: z.string().min(1, { message: "Message is required." }),
        date: z.coerce
          .date()
          .default(moment().format("YYYY-MM-DD"))
          .transform((date) => moment(date).format("YYYY-MM-DD")),
        is_active: z.boolean().default(false),
      }),
    ),
    defaultValues,
  });

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;

  const { data, isLoading, isError, error } = useGetScheme(id);
  const createMutation = useCreateScheme(onSuccess);
  const updateMutation = useUpdateScheme(id, onSuccess);

  const onSubmit = async (data) => {
    if (!fileUrl?.length && !file.length)
      return setError("file", { type: "manual", message: "File is required*" });

    const formData = new FormData();
    formData.append("file", file[0]);
    Object.entries(data).forEach(([key, value]) => {
      typeof value === "object"
        ? formData.append(key, JSON.stringify(value))
        : formData.append(key, value);
    });

    if (type === "edit") {
      formData.append("file_url", JSON.stringify(fileUrl));
    }

    type === "create"
      ? createMutation.mutate(formData)
      : updateMutation.mutate(formData);
  };

  useEffect(() => {
    if (type === "edit" && data) {
      data.file && setFileUrl(data?.file ?? []);
      reset({ ...data });
    }
  }, [type, data, id, reset]);

  const handleFileChange = useCallback((data) => {
    setFile(data);
  }, []);

  const isFormPending =
    (type === "edit" && updateMutation.isPending) ||
    (type === "create" && createMutation.isPending);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Logo URL */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="file">File *</Label>
          {fileUrl?.length === 0 && (
            <FileUpload
              onFileChange={handleFileChange}
              inputName={"file"}
              className={cn("h-44 min-h-10", { "border-red-500": errors.file })}
              initialFiles={[]}
              multiple={false}
              maxFiles={1}
              grid={"grid-cols-[repeat(auto-fill,minmax(80px,1fr))]"}
            />
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
            {fileUrl?.map((src, index) => (
              <div
                className="bg-accent relative aspect-square w-24 rounded-md"
                key={index}
              >
                <Image
                  src={`${config.file_base}/${src}`}
                  width={200}
                  height={200}
                  className="size-full rounded-[inherit] object-cover"
                  alt={`carousel-${index}`}
                />
                <Button
                  onClick={() =>
                    setFileUrl((prev) => prev.filter((i) => i !== src))
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

        {/* Message */}
        <div className="col-span-full space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            placeholder="Enter Message"
            {...register("message")}
            className={cn({ "border-red-500": errors.message })}
          />
        </div>

        {/* date */}
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => {
              return (
                <DatePicker onChange={field.onChange} value={field.value} />
              );
            }}
          />
        </div>
        <div className="col-span-full">
          <Controller
            key="is_active"
            name="is_active"
            control={control}
            render={({ field }) => (
              <Label
                id="toggle-2"
                className="hover:bg-accent/50 border-input dark:has-[[aria-checked=true]]:bg-primary/10 has-[[aria-checked=true]]:border-primary dark:has-[[aria-checked=true]]:border-primary flex w-max items-start gap-3 rounded-lg border p-3 has-[[aria-checked=true]]:bg-blue-50"
              >
                <Checkbox
                  id="toggle-2"
                  onCheckedChange={field.onChange}
                  checked={field.value}
                />
                <div className="grid gap-1.5 font-normal">
                  <p className="text-sm leading-none font-medium">
                    Mark as active
                  </p>
                </div>
              </Label>
            )}
          />
        </div>
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
