"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { CirclePlus, LoaderCircleIcon, Trash2, XIcon } from "lucide-react";
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
import FileUpload from "../file-uploader";
import { useCallback, useEffect, useState } from "react";
import {
  useCreateVehicleVariant,
  useGetVehicleVariant,
  useUpdateVehicleVariant,
} from "@/mutations/vehicle-variant-mutation";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import config from "@/config";
import Image from "next/image";
import { useRouter } from "next/navigation";
import VehicleModelSelectMulti from "@/features/vehicle-model-select-multi";

const defaultValues = {
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
};

export default function VariantForm({ vehicleId, type = "create", id }) {
  const [fileUrls, setFileUrls] = useState({
    carousel_urls: [],
    gallery_urls: [],
  });
  const [files, setFiles] = useState({
    carousel: [],
    gallery: [],
  });
  const router = useRouter();
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
    reset,
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "chassis_numbers",
  });

  const createMutation = useCreateVehicleVariant(() =>
    router.push(`/vehicles?page=1&limit=10`),
  );
  const { data, isLoading, isError, error } = useGetVehicleVariant(id);
  const updateMutation = useUpdateVehicleVariant(id, () =>
    router.push(`/vehicles?page=1&limit=10`),
  );

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

    files.carousel?.forEach((file) => {
      formData.append("carousel", file);
    });
    files.gallery?.forEach((file) => {
      formData.append("gallery", file);
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

    // return;
    type === "create"
      ? createMutation.mutate(formData)
      : updateMutation.mutate(formData);
  };

  useEffect(() => {
    if (type === "edit" && data) {
      reset({ ...data });
      setFileUrls((prev) => ({
        ...prev,
        gallery_urls: data.gallery,
        carousel_urls: data.carousel,
      }));
    }
  }, [data, type, reset]);

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  const handleCarouselChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, carousel: data }));
  }, []);
  const handleGalleryChange = useCallback((data) => {
    setFiles((prev) => ({ ...prev, gallery: data }));
  }, []);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-2">
          {/* images */}
          <div className="col-span-full space-y-4">
            <Label>Carousel</Label>
            <FileUpload
              onFileChange={handleCarouselChange}
              inputName={"carousel"}
              className={cn({ "border-red-500": errors.carousel })}
              initialFiles={[]}
              multiple={true}
              maxFiles={50}
            />

            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
              {fileUrls.carousel_urls?.map((src, index) => (
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
                      setFileUrls((prev) => ({
                        ...prev,
                        carousel_urls: prev.carousel_urls.filter(
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
                </div>
              ))}
            </div>
          </div>

          {/* gallery */}
          <div className="col-span-full space-y-4">
            <Label>Gallery</Label>
            <FileUpload
              onFileChange={handleGalleryChange}
              inputName={"gallery"}
              className={cn({ "border-red-500": errors.gallery })}
              initialFiles={[]}
              multiple={true}
              maxFiles={50}
            />

            <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4">
              {fileUrls.gallery_urls?.map((src, index) => (
                <div
                  className="bg-accent relative aspect-square w-24 rounded-md"
                  key={index}
                >
                  <Image
                    src={`${config.file_base}/${src}`}
                    width={200}
                    height={200}
                    className="size-full rounded-[inherit] object-cover"
                    alt={`gallery-${index}`}
                  />
                  <Button
                    onClick={() =>
                      setFileUrls((prev) => ({
                        ...prev,
                        gallery_urls: prev.gallery_urls.filter(
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
                </div>
              ))}
            </div>
          </div>

          {/* Select color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <Controller
              name="color_hex"
              control={control}
              render={({ field }) => {
                return (
                  <Select
                    key={field.value}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue(
                        "color_name",
                        colors.find((c) => c.value === value).label,
                      );
                    }}
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

          {/* Select model */}
          <div className="space-y-2">
            <Label>Models</Label>
            <Controller
              name="vehicle_models"
              control={control}
              render={({ field }) => {
                return (
                  <VehicleModelSelectMulti
                    onChange={field.onChange}
                    value={field.value}
                  />
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
