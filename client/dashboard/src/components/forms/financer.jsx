"use client";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  LoaderCircleIcon,
  Trash2Icon,
  Plus,
  XIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { getFormErrors } from "@/lib/get-form-errors";
import {
  useCreateFinancer,
  useGetFinancer,
  useUpdateFinancer,
} from "@/mutations/financer-mutation";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { useState, useCallback, useEffect } from "react";
import FileUpload from "../file-uploader";
import { financerSchema } from "@/utils/schema/financer.schema";
import { StateSelect } from "@/features/state-select";
import CitySelectMuti from "@/features/city-select-muti";
import config from "@/config";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

export default function FinancerForm({ type, id }) {
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
    resolver: zodResolver(financerSchema),
    defaultValues,
  });

  const {
    fields: areaFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "area_serve",
  });
  const router = useRouter();
  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;

  const { data, isLoading, isError, error } = useGetFinancer(id);
  const createMutation = useCreateFinancer(function () {
    router.push(`/financers?page=1&limit=10`);
  });
  const updateMutation = useUpdateFinancer(id, function () {
    router.back();
  });
  const onSubmit = async (data) => {
    if (!fileUrl?.length && !file.length)
      return setError("logo", { type: "manual", message: "Logo is required*" });

    const formData = new FormData();
    formData.append("logo", file[0]);
    Object.entries(data).forEach(([key, value]) => {
      typeof value === "object"
        ? formData.append(key, JSON.stringify(value))
        : formData.append(key, value);
    });

    if (type === "edit") {
      formData.append("logo_url", JSON.stringify(fileUrl));
    }

    type === "create"
      ? createMutation.mutate(formData)
      : updateMutation.mutate(formData);
  };

  useEffect(() => {
    if (type === "edit" && data) {
      data.logo && setFileUrl(data?.logo ?? []);
      reset({
        ...data,
        interest_percentage: parseFloat(data.interest_percentage),
      });
    }
  }, [type, data, id, reset]);

  const handleLogoChange = useCallback((data) => {
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
          <Label htmlFor="logo">Logo *</Label>
          {fileUrl?.length === 0 && (
            <FileUpload
              onFileChange={handleLogoChange}
              inputName={"logo"}
              className={cn({ "border-red-500": errors.logo })}
              initialFiles={[]}
              multiple={false}
              maxFiles={1}
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

        {/* Financer Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Financer Name *</Label>
          <Input
            id="name"
            placeholder="Enter financer name"
            {...register("name")}
            className={cn({ "border-red-500": errors.name })}
          />
        </div>

        {/* Financer interest percentage */}
        <div className="space-y-2">
          <Label htmlFor="name">Interest Percentage *</Label>
          <Input
            type="number"
            step="0.01"
            id="name"
            placeholder="Enter Interest Percentage"
            {...register("interest_percentage", { valueAsNumber: true })}
            className={cn({ "border-red-500": errors.interest_percentage })}
          />
        </div>

        {/* area serve */}
        <div className="col-span-full space-y-4">
          <Label>Area Serve *</Label>
          {areaFields.map((field, index) => {
            const stateValue = watch(`area_serve.${index}.state_code`);
            return (
              <div
                key={field.id}
                className="border-input relative space-y-4 rounded-md border p-4"
              >
                <Button
                  size={"icon"}
                  variant={"destructive"}
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-2 right-2"
                >
                  <Trash2Icon size={18} />
                </Button>

                {/* State Select */}
                <div className="space-y-2">
                  <Label htmlFor={`area_serve.${index}.state`}>State *</Label>
                  <div>
                    <Controller
                      control={control}
                      name={`area_serve.${index}.state`}
                      render={({ field }) => (
                        <StateSelect
                          value={field.value}
                          onChange={(value) => {
                            field.onChange(value);
                            setValue(`area_serve.${index}.city`, []);
                          }}
                          setStateCode={(code) =>
                            setValue(`area_serve.${index}.state_code`, code)
                          }
                          className={cn({
                            "border-red-500 dark:border-red-500":
                              errors?.area_serve?.[index]?.state,
                          })}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* City Multi-Select */}
                <div className="space-y-2">
                  <Label htmlFor={`area_serve.${index}.city`}>Cities *</Label>
                  <Controller
                    control={control}
                    name={`area_serve.${index}.city`}
                    render={({ field }) => (
                      <CitySelectMuti
                        value={field.value}
                        onChange={field.onChange}
                        stateValue={stateValue}
                        className={cn({
                          "border-red-500": errors?.area_serve?.[index]?.city,
                        })}
                      />
                    )}
                  />
                </div>
              </div>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ state: "", city: [] })}
            className="flex gap-1"
          >
            <Plus size={16} /> Add Area
          </Button>
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
