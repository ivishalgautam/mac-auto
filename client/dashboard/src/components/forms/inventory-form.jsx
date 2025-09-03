"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus, LoaderCircleIcon, Trash2, X } from "lucide-react";
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
import { useState } from "react";
import { useCreateVehicleColor } from "@/mutations/vehicle-color-mutation";

const defaultValues = {
  color_name: "", // NEW
  color_hex: "", // NEW
  chassis_numbers: [
    {
      number: "",
      motor_no: "",
      battery_no: "",
      controller_no: "",
      charger_no: "",
    },
  ],
};

export default function InventoryForm({ vehicleId }) {
  const [fileUrls, setFileUrls] = useState({
    carousel_urls: [],
    gallery_urls: [],
  });
  const [files, setFiles] = useState({
    carousel: [],
    gallery: [],
  });

  const methods = useForm({
    resolver: zodResolver(inventorySchema),
    defaultValues: { ...defaultValues, vehicle_id: vehicleId },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    control,
    setError,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chassis_numbers",
  });

  const createMutation = useCreateVehicleColor(() => {});

  const onSubmit = (data) => {
    if (!fileUrls?.carousel_urls?.length && !files.carousel.length) {
      return setError("carousel", {
        type: "manual",
        message: "Atleat 1 carousel is required*",
      });
    }
    if (!fileUrls?.gallery_urls?.length && !files.gallery.length) {
      return setError("gallery", {
        type: "manual",
        message: "Atleat 1 gallery is required*",
      });
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      typeof value === "object"
        ? formData.append(key, JSON.stringify(value))
        : formData.append(key, value);
    });
    // return;
    createMutation.mutate(data);
  };

  const isFormPending = createMutation.isPending;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2">
          {/* Select color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <Controller
              name="color_hex"
              control={control}
              render={({ field }) => {
                return (
                  <Select
                    key={"color_hex"}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue(
                        "color_name",
                        colors.find((c) => c.value === value).label,
                      );
                    }}
                    value={field.value}
                  >
                    <SelectTrigger
                      className={cn("w-full", {
                        "border-red-500": errors?.color?.color_hex,
                      })}
                    >
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
                );
              }}
            />
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color.message}</p>
            )}
          </div>
        </div>

        {/* chassis no. */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Chassis Numbers</h3>
          <div className="space-y-4">
            {fields.map((_, index) => {
              return (
                <div
                  key={index}
                  className="border-input relative grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 rounded-lg border p-4"
                >
                  <Button
                    type="button"
                    className={"border-background absolute -top-2 -right-2"}
                    variant={"destructive"}
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 />
                  </Button>
                  <div className="space-y-2">
                    <Label>Chassis #{index + 1}</Label>
                    <Input
                      type="text"
                      {...register(`chassis_numbers.${index}.number`)}
                      placeholder={`Enter chassis number ${index + 1}`}
                      className={cn({
                        "border-red-500":
                          errors?.chassis_numbers?.[index]?.number,
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Motor No.</Label>
                    <Input
                      type="text"
                      {...register(`chassis_numbers.${index}.motor_no`)}
                      placeholder="Enter motor number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Battery No.</Label>
                    <Input
                      type="text"
                      {...register(`chassis_numbers.${index}.battery_no`)}
                      placeholder="Enter battery number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Controller No.</Label>
                    <Input
                      type="text"
                      {...register(`chassis_numbers.${index}.controller_no`)}
                      placeholder="Enter controller number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Charger No.</Label>
                    <Input
                      type="text"
                      {...register(`chassis_numbers.${index}.charger_no`)}
                      placeholder="Enter charger number"
                    />
                  </div>
                </div>
              );
            })}

            {/* append button */}
            <div className="text-end">
              <Button
                type="button"
                size="sm"
                variant={"outline"}
                onClick={() =>
                  append({
                    number: "",
                    motor_no: "",
                    battery_no: "",
                    controller_no: "",
                    charger_no: "",
                  })
                }
              >
                <CirclePlus />
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="text-end">
          <Button
            type="submit"
            disabled={isFormPending || !isDirty}
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
