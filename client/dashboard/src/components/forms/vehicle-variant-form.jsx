"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus, LoaderCircleIcon, Trash2 } from "lucide-react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";

import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useBulkCreateVehicleVariant,
  useGetVehicleVariant,
  useUpdateVehicleVariant,
} from "@/mutations/vehicle-variant-mutation";

// ✅ schemas
const singleSchema = z.object({
  variant_name: z.string().min(1, "Variant name is required."),
});

const bulkSchema = z.object({
  variant_names: z
    .array(
      z.object({
        variant_name: z
          .string()
          .min(1, { message: "Variant name is required." }),
      }),
    )
    .min(1, { message: "At least 1 variant name is required." }),
});

export default function VehicleVariantForm({ type = "create", id }) {
  const router = useRouter();
  const [isBulk, setIsBulk] = useState(false);

  const methods = useForm({
    resolver: zodResolver(isBulk ? bulkSchema : singleSchema),
    defaultValues: isBulk
      ? { variant_names: [{ variant_name: "" }] }
      : { variant_name: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "variant_names",
  });

  const bulkCreateMutation = useBulkCreateVehicleVariant(() =>
    router.push(`/vehicles/variants?page=1&limit=10`),
  );
  const { data, isLoading, isError, error } = useGetVehicleVariant(id);
  const updateMutation = useUpdateVehicleVariant(id, () =>
    router.push(`/vehicles/variants?page=1&limit=10`),
  );

  const onSubmit = (data) => {
    if (type === "create") {
      if (isBulk) {
        bulkCreateMutation.mutate(data);
      } else {
        bulkCreateMutation.mutate({ variant_name: data.variant_name });
      }
    } else {
      updateMutation.mutate({ variant_name: data.variant_name });
    }
  };

  // ✅ load existing data on edit
  useEffect(() => {
    if (type === "edit" && data) {
      reset({ variant_name: data.variant_name });
    }
  }, [data, type, reset]);

  const isFormPending =
    (type === "create" && bulkCreateMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ✅ Only show toggle in create mode */}
        {type === "create" && (
          <div className="">
            <Label>Mode</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={!isBulk ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsBulk(false);
                  reset({ variant_name: "" });
                }}
              >
                Single
              </Button>
              <Button
                type="button"
                variant={isBulk ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setIsBulk(true);
                  reset({ variant_names: [{ variant_name: "" }] });
                }}
              >
                Bulk
              </Button>
            </div>
          </div>
        )}

        {/* ✅ Single input */}
        {(!isBulk || type === "edit") && (
          <div className="space-y-2">
            <Label>Model Name</Label>
            <Input
              type="text"
              placeholder="Enter vehicle model name"
              {...register("variant_name")}
              className={cn({ "border-red-500": errors?.variant_name })}
            />
            {errors?.variant_name && (
              <p className="text-sm text-red-500">
                {errors.variant_name.message}
              </p>
            )}
          </div>
        )}

        {/* ✅ Bulk inputs */}
        {isBulk && type === "create" && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vehicle Models</h3>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border-input relative flex items-start gap-2 rounded-lg border p-4"
              >
                <div className="flex-1 space-y-2">
                  <Label>Model #{index + 1}</Label>
                  <Input
                    type="text"
                    placeholder={`Enter model name ${index + 1}`}
                    {...register(`variant_names.${index}.variant_name`)}
                    className={cn({
                      "border-red-500":
                        errors?.variant_names?.[index]?.variant_name,
                    })}
                  />
                  {errors?.variant_names?.[index]?.variant_name && (
                    <p className="text-sm text-red-500">
                      {errors.variant_names[index]?.variant_name?.message}
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="mt-6"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 />
                </Button>
              </div>
            ))}

            {/* add button */}
            <div className="text-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => append({ variant_name: "" })}
              >
                <CirclePlus className="me-1" />
                Add Model
              </Button>
            </div>
          </div>
        )}

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
      </form>
    </FormProvider>
  );
}
