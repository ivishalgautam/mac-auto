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
  useBulkCreateVehicleModel,
  useGetVehicleModel,
  useUpdateVehicleModel,
} from "@/mutations/vehicle-model-mutation";

// ✅ schemas
const singleSchema = z.object({
  model_name: z.string().min(1, "Model name is required."),
});

const bulkSchema = z.object({
  model_names: z
    .array(
      z.object({
        model_name: z.string().min(1, { message: "Model name is required." }),
      }),
    )
    .min(1, { message: "At least 1 model name is required." }),
});

export default function VehicleModelForm({ type = "create", id }) {
  const router = useRouter();
  const [isBulk, setIsBulk] = useState(false);

  const methods = useForm({
    resolver: zodResolver(isBulk ? bulkSchema : singleSchema),
    defaultValues: isBulk
      ? { model_names: [{ model_name: "" }] }
      : { model_name: "" },
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
    name: "model_names",
  });

  const bulkCreateMutation = useBulkCreateVehicleModel(() =>
    router.push(`/vehicles/models?page=1&limit=10`),
  );
  const { data, isLoading, isError, error } = useGetVehicleModel(id);
  const updateMutation = useUpdateVehicleModel(id, () =>
    router.push(`/vehicles/models?page=1&limit=10`),
  );

  const onSubmit = (data) => {
    if (type === "create") {
      if (isBulk) {
        bulkCreateMutation.mutate(data);
      } else {
        bulkCreateMutation.mutate({ model_name: data.model_name });
      }
    } else {
      updateMutation.mutate({ model_name: data.model_name });
    }
  };

  // ✅ load existing data on edit
  useEffect(() => {
    if (type === "edit" && data) {
      reset({ model_name: data.model_name });
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
                  reset({ model_name: "" });
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
                  reset({ model_names: [{ model_name: "" }] });
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
              {...register("model_name")}
              className={cn({ "border-red-500": errors?.model_name })}
            />
            {errors?.model_name && (
              <p className="text-sm text-red-500">
                {errors.model_name.message}
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
                    {...register(`model_names.${index}.model_name`)}
                    className={cn({
                      "border-red-500":
                        errors?.model_names?.[index]?.model_name,
                    })}
                  />
                  {errors?.model_names?.[index]?.model_name && (
                    <p className="text-sm text-red-500">
                      {errors.model_names[index]?.model_name?.message}
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
                onClick={() => append({ model_name: "" })}
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
