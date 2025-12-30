"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircleIcon } from "lucide-react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";
import { cn } from "@/lib/utils";
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
import { useOrderItem, useUpdateOrderItem } from "@/mutations/use-orders";
import { useEffect } from "react";
import z from "zod";

const inventorySchema = z.object({
  order_item_id: z.string().uuid({ message: "Select valid order item ID" }),
  colors: z.array(
    z.object({
      vehicle_id: z.string().uuid({ message: "Select valid vehicle ID" }),
      color_name: z.string().min(1, { message: "Color name is required" }),
      color_hex: z.string().min(1, { message: "Color HEX is required" }),
      chassis_numbers: z.array(
        z.object({
          chassis_no: z
            .string({ required_error: "required*" })
            .min(1, { message: "required*" }),
          motor_no: z
            .string({ required_error: "required*" })
            .min(1, { message: "required*" }),
          battery_no: z
            .string({ required_error: "required*" })
            .min(1, { message: "required*" }),
          controller_no: z
            .string({ required_error: "required*" })
            .min(1, { message: "required*" }),
          charger_no: z
            .string({ required_error: "required*" })
            .min(1, { message: "required*" }),
        }),
      ),
      quantity: z
        .number({
          required_error: "Quantity is required",
          invalid_type_error: "Quantity must be a number",
        })
        .int()
        .positive({ message: "Quantity must be greater than 0" }),
    }),
  ),
});

const defaultValues = {
  order_item_id: "",
  colors: [
    {
      vehicle_id: "",
      color_name: "",
      color_hex: "",
      chassis_numbers: [
        {
          chassis_no: "",
          motor_no: "",
          battery_no: "",
          controller_no: "",
          charger_no: "",
        },
      ],
    },
  ],
};

export default function OrderItemDetailsForm({ type = "create", id }) {
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

  const callback = () => router.back();

  const createMutation = useCreateVehicleColor(callback);
  const updateMutation = useUpdateOrderItem(id, itemId, callback);
  const { data, isLoading, isError, error } = useOrderItem(itemId);

  const onSubmit = (data) => {
    if (type === "create") {
      createMutation.mutate(data);
    }
    if (type === "edit") {
      const payload = {
        colors: data.colors.map((color) => ({
          color: color.color_name,
          details: color.chassis_numbers,
          quantity: color.quantity,
        })),
      };

      updateMutation.mutate(payload);
    }
  };

  useEffect(() => {
    if (data) {
      console.log({ data });
      reset({
        order_item_id: itemId,
        colors: data.colors.map((c) => {
          return {
            vehicle_id: data.vehicle_id,
            color_name: c.color,
            color_hex: colors.find(
              (color) => color.label.toLowerCase() === c.color.toLowerCase(),
            ).value,
            chassis_numbers:
              type === "create"
                ? Array(c.quantity).fill({
                    chassis_no: "",
                    motor_no: "",
                    battery_no: "",
                    controller_no: "",
                    charger_no: "",
                  })
                : c.details &&
                    Array.isArray(c.details) &&
                    c.details.length < c.quantity
                  ? [
                      ...c.details,
                      Array(c.quantity - c.details.length).fill({
                        chassis_no: "",
                        motor_no: "",
                        battery_no: "",
                        controller_no: "",
                        charger_no: "",
                      }),
                    ]
                  : c.details,
            quantity: c.quantity,
          };
        }),
      });
    }
  }, [data, reset]);

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorMessage error={error} />;

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
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <div
                    className="inline-block size-6 rounded-full"
                    style={{ background: colorField.color_hex }}
                  />
                  <span>{colorField.color_name} </span>
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
                type={type}
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
function ChassisList({ nestIndex, control, register, errors, type }) {
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
            name={`colors.${nestIndex}.chassis_numbers.${index}.chassis_no`}
            register={register}
            disabled={type === "view"}
            error={
              errors?.colors?.[nestIndex]?.chassis_numbers?.[index]?.chassis_no
            }
            placeholder={`Enter chassis number`}
          />
          <InputGroup
            label="Motor No."
            name={`colors.${nestIndex}.chassis_numbers.${index}.motor_no`}
            register={register}
            disabled={type === "view"}
            error={
              errors?.colors?.[nestIndex]?.chassis_numbers?.[index]?.motor_no
            }
            placeholder="Enter motor number"
          />
          <InputGroup
            label="Battery No."
            name={`colors.${nestIndex}.chassis_numbers.${index}.battery_no`}
            register={register}
            disabled={type === "view"}
            error={
              errors?.colors?.[nestIndex]?.chassis_numbers?.[index]?.battery_no
            }
            placeholder="Enter battery number"
          />
          <InputGroup
            label="Controller No."
            name={`colors.${nestIndex}.chassis_numbers.${index}.controller_no`}
            register={register}
            disabled={type === "view"}
            error={
              errors?.colors?.[nestIndex]?.chassis_numbers?.[index]
                ?.controller_no
            }
            placeholder="Enter controller number"
          />
          <InputGroup
            label="Charger No."
            name={`colors.${nestIndex}.chassis_numbers.${index}.charger_no`}
            register={register}
            disabled={type === "view"}
            error={
              errors?.colors?.[nestIndex]?.chassis_numbers?.[index]?.charger_no
            }
            placeholder="Enter charger number"
          />
        </div>
      ))}
    </div>
  );
}

function InputGroup({ label, name, register, error, placeholder, disabled }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        {...register(name)}
        placeholder={placeholder}
        className={cn({ "border-red-500": error })}
        disabled={disabled}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
