"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus, LoaderCircleIcon, Trash2 } from "lucide-react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { inventorySchema } from "@/utils/schema/vehicle.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { colors } from "@/data";
import {
  useCreateVehicleColor,
  useUpdateVehicleColor,
} from "@/mutations/vehicle-color-mutation";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "@/components/loader";
import ErrorMessage from "@/components/ui/error";
import { useOrderItem } from "@/mutations/use-orders";
import { useEffect } from "react";

const defaultValues = {
  colors: [
    {
      color_name: "",
      color_hex: "",
      chassis_numbers: [
        {
          number: "",
          motor_no: "",
          battery_no: "",
          controller_no: "",
          charger_no: "",
        },
      ],
    },
  ],
};

export default function Page({ type = "create", id }) {
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId");
  const router = useRouter();

  const methods = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: { ...defaultValues, vehicle_id: itemId },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    reset,
  } = methods;

  const {
    fields: colorFields,
    append: appendColor,
    remove: removeColor,
  } = useFieldArray({
    control,
    name: "colors",
  });

  const createMutation = useCreateVehicleColor(() =>
    router.push(`/vehicles?page=1&limit=10`),
  );
  const updateMutation = useUpdateVehicleColor(id, () =>
    router.push(`/vehicles?page=1&limit=10`),
  );

  const { data, isLoading, isError, error } = useOrderItem(itemId);

  const onSubmit = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      typeof value === "object"
        ? formData.append(key, JSON.stringify(value))
        : formData.append(key, value);
    });

    type === "create"
      ? createMutation.mutate(formData)
      : updateMutation.mutate(formData);
  };

  useEffect(() => {
    if (data) {
      reset({
        colors: data.colors.map((c) => {
          return {
            color_name: c.color,
            color_hex: colors.find(
              (color) => color.label.toLowerCase() === c.color.toLowerCase(),
            ).value,
            chassis_numbers: Array(c.quantity).fill({
              number: "",
              motor_no: "",
              battery_no: "",
              controller_no: "",
              charger_no: "",
            }),
          };
        }),
      });
    }
  }, [data, reset]);

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {colorFields.map((colorField, colorIndex) => {
          const colorPath = `colors.${colorIndex}`;
          return (
            <div
              key={colorField.id}
              className="border-input relative space-y-4 rounded-lg border p-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {colorField.color_name}
                </h3>
              </div>

              {/* Color selection */}
              <div className="space-y-2">
                <Label>Color</Label>
                <Controller
                  name={`${colorPath}.color_hex`}
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        const color = colors.find((c) => c.value === value);
                        setValue(`${colorPath}.color_name`, color?.label);
                      }}
                      disabled
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            {color.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Chassis numbers for this color */}
              <ChassisList
                nestIndex={colorIndex}
                control={control}
                register={register}
                errors={errors}
              />
            </div>
          );
        })}

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

/**
 * Nested chassis list component
 */
function ChassisList({ nestIndex, control, register, errors }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `colors.${nestIndex}.chassis_numbers`,
  });

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium">Chassis Numbers</h4>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="border-input relative grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 rounded-lg border p-4"
        >
          <InputGroup
            label={`Chassis #${index + 1}`}
            name={`colors.${nestIndex}.chassis_numbers.${index}.number`}
            register={register}
            error={
              errors?.colors?.[nestIndex]?.chassis_numbers?.[index]?.number
            }
            placeholder={`Enter chassis number`}
          />
          <InputGroup
            label="Motor No."
            name={`colors.${nestIndex}.chassis_numbers.${index}.motor_no`}
            register={register}
            placeholder="Enter motor number"
          />
          <InputGroup
            label="Battery No."
            name={`colors.${nestIndex}.chassis_numbers.${index}.battery_no`}
            register={register}
            placeholder="Enter battery number"
          />
          <InputGroup
            label="Controller No."
            name={`colors.${nestIndex}.chassis_numbers.${index}.controller_no`}
            register={register}
            placeholder="Enter controller number"
          />
          <InputGroup
            label="Charger No."
            name={`colors.${nestIndex}.chassis_numbers.${index}.charger_no`}
            register={register}
            placeholder="Enter charger number"
          />
        </div>
      ))}
    </div>
  );
}

function InputGroup({ label, name, register, error, placeholder }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        {...register(name)}
        placeholder={placeholder}
        className={cn({ "border-red-500": error })}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
