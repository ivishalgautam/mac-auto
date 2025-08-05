"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ExternalLink,
  LoaderCircleIcon,
  Plus,
  Trash,
  XIcon,
} from "lucide-react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "../ui/alert";
import { getFormErrors } from "@/lib/get-form-errors";
import { useEffect } from "react";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import {
  vehicleSchema,
  vehicleUpdateSchema,
} from "@/utils/schema/vehicle.schema";
import {
  useCreateVehicle,
  useGetVehicle,
  useUpdateVehicle,
} from "@/mutations/vehicle-mutation";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { colors } from "@/data";
import useFetchVehicles from "@/hooks/use-fetch-vehicles";
import FileUpload from "@/components/file-uploader";
import { useState } from "react";
import Image from "next/image";
import config from "@/config";
import { Skeleton } from "../ui/skeleton";
import Features from "./vehicle/feature";
import EMICalculator from "./vehicle/emi-calculator";
import Specifications from "./vehicle/specifications";
import { useCallback } from "react";

const defaultValues = {
  carousel: [],
  category: "",
  title: "",
  description: "",
  slug: "",
  vehicle_id: null,
  is_variant: false,
  color: "",
  quantity: "",
  variants: [],
  features: [{ heading: "", image: null }],
  specifications: [{ tab_name: "", specs: [{ label: "", value: "" }] }],
  base_price: "",
  dealer_price: "",
  video_link: "",
  // pricing: [
  //   ...stateCityData.map((state, idx, arr) => {
  //     return {
  //       name: state.state,
  //       base_price: "",
  //       cities: arr
  //         .filter((item) => {
  //           return item.state === state.state;
  //         })
  //         .map((item) => ({ name: item.city, price_modifier: 0 })),
  //     };
  //   }),
  //   // {
  //   //   id: "",
  //   //   name: "",
  //   //   base_price: "",
  //   //   cities: [],
  //   // },
  // ],
  emi_calculator: {
    default_values: {
      down_payment: "",
      loan_tenure: "",
      interest_rate: "",
    },
    ranges: {
      down_payment: { min: "", step: "" },
      loan_tenure: { min: "", max: "", step: "" },
      interest_rate: { min: "", max: "", step: "" },
    },
    financing_companies: [],
  },
};

export default function VehicleForm({ id, type }) {
  const router = useRouter();
  const [files, setFiles] = useState({
    carousel: [],
    gallery: [],
    marketing_material: [],
    brochure: [],
  });
  const [fileUrls, setFileUrls] = useState({
    carousel_urls: [],
    gallery_urls: [],
    marketing_material_urls: [],
    brochure_urls: [],
  });
  const methods = useForm({
    resolver: zodResolver(
      type === "create" ? vehicleSchema : vehicleUpdateSchema,
    ),
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
    watch,
    setError,
    setValue,
  } = methods;
  const vehicleId = watch("vehicle_id");
  const quantity = watch("quantity");
  const {
    fields: pricingFields,
    append: appendPricing,
    remove: removePricing,
  } = useFieldArray({ control, name: "pricing" });

  const {
    data: formattedVehicles,
    isLoading: isFormattedVehiclesLoading,
    isError: isFormattedVehiclesError,
    error: formattedVehiclesError,
  } = useFetchVehicles();

  const createMutation = useCreateVehicle(() => {
    reset();
    router.push("/vehicles?page=1&limit=10");
  });
  const updateMutation = useUpdateVehicle(id, () => {
    reset();
    router.push("/vehicles?page=1&limit=10");
  });
  const { data, isLoading, isError, error } = useGetVehicle(id);
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
    files.marketing_material?.forEach((file) => {
      formData.append("marketing_material", file);
    });
    files.brochure?.forEach((file) => {
      formData.append("brochure", file);
    });

    Object.entries(data).forEach(([key, value]) => {
      typeof value === "object"
        ? formData.append(key, JSON.stringify(value))
        : formData.append(key, value);
    });

    data.features?.forEach((item, index) => {
      if (item.heading) {
        formData.append(`features[${index}][heading]`, item.heading);
      }
      if (item.image && typeof item.image === "object") {
        formData.append(`features[${index}][image]`, item.image);
      }
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
    if (type === "edit" && data) {
      setFileUrls((prev) => ({
        ...prev,
        gallery_urls: data.gallery,
        carousel_urls: data.carousel,
        marketing_material_urls: data.marketing_material,
        brochure_urls: data.brochure,
      }));
      reset({
        ...data,
        base_price: data?.base_price ?? data?.pricing?.[0].base_price ?? 0,
      });
    }
  }, [data, type, reset]);

  useEffect(() => {
    if (quantity > 0) {
      const chassisNumbers = Array.from({ length: quantity }, (_, i) => ({
        number: "",
      }));
      setValue("chassis_numbers", chassisNumbers);
    }
  }, [quantity, setValue]);

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
        <div className="grid grid-cols-3 gap-4">
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

          {/* marketing materials */}
          <div className="col-span-full space-y-4">
            <Label>Marketing Materials</Label>
            <Input
              type="file"
              multiple
              onChange={(e) =>
                setFiles((prev) => ({
                  ...prev,
                  marketing_material: Array.from(e.target.files),
                }))
              }
            />
            <div className="flex flex-wrap items-center justify-start gap-2">
              {fileUrls?.marketing_material_urls?.map((file, index) => (
                <div
                  key={index}
                  className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <a href={`${config.file_base}/${file}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <span className="truncate">{file.split("\\").pop()}</span>
                  </div>
                  <Button
                    onClick={() =>
                      setFileUrls((prev) => ({
                        ...prev,
                        marketing_material_urls:
                          prev.marketing_material_urls.filter(
                            (i) => i !== file,
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

          {/* Brochure */}
          <div className="col-span-full space-y-4">
            <Label>Brochure</Label>
            <Input
              type="file"
              multiple
              onChange={(e) =>
                setFiles((prev) => ({
                  ...prev,
                  brochure: Array.from(e.target.files),
                }))
              }
            />
            <div className="flex flex-wrap items-center justify-start gap-2">
              {fileUrls?.brochure_urls?.map((file, index) => (
                <div
                  key={index}
                  className="hover:bg-muted/50 relative flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <a>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <span className="truncate">{file.split("\\").pop()}</span>
                  </div>
                  <Button
                    onClick={() =>
                      setFileUrls((prev) => ({
                        ...prev,
                        brochure_urls: prev.brochure_urls.filter(
                          (i) => i !== file,
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

          {/* vehicle id */}
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">Vehicle</Label>
            {isFormattedVehiclesLoading ? (
              <Skeleton className={"h-9 w-full"} />
            ) : isFormattedVehiclesError ? (
              <ErrorMessage error={formattedVehiclesError} />
            ) : (
              <Controller
                control={control}
                name="vehicle_id"
                render={({ field }) => (
                  <Select
                    key={field.value}
                    onValueChange={field.onChange}
                    value={field.value ?? ""}
                    defaultValue={field.value ?? ""}
                  >
                    <SelectTrigger
                      className={cn("w-full", {
                        "border-red-500": errors.vehicle_id,
                      })}
                    >
                      <SelectValue placeholder="Select a vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {formattedVehicles.map((vehicle) => (
                        <SelectItem
                          key={vehicle.value}
                          value={vehicle.value}
                          className={"capitalize"}
                        >
                          {vehicle.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            )}
          </div>

          {/* category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <Select
                  key={field.value}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={cn("w-full", {
                      "border-red-500": errors.category,
                    })}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="passenger">Passenger</SelectItem>
                    <SelectItem value="cargo">Cargo</SelectItem>
                    <SelectItem value="garbage">Garbage</SelectItem>
                    <SelectItem value="loader">Loader</SelectItem>
                    <SelectItem value="e-cycle">E-Cycle</SelectItem>
                    <SelectItem value="e-scooter">E-Scooter</SelectItem>
                    <SelectItem value="golf">Golf</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              className={cn({ "border-red-500": errors.title })}
              placeholder="Enter title"
            />
          </div>

          {/* color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <Controller
              name={`color`}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                  key={field.value}
                >
                  <SelectTrigger
                    className={cn("w-full", {
                      "border-red-500": errors?.color,
                    })}
                  >
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem
                        key={color.value}
                        value={color.value}
                        className={"capitalize"}
                      >
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* base price */}
          <div className="space-y-2">
            <Label>Base Price *</Label>
            <Input
              type="number"
              placeholder="Enter Base Price"
              {...register(`base_price`, { valueAsNumber: true })}
              className={cn({ "border-red-500": errors.base_price })}
            />
          </div>

          {/* dealer price */}
          <div className="space-y-2">
            <Label>Dealer price *</Label>
            <Input
              type="number"
              placeholder="Enter Dealer Price"
              {...register(`dealer_price`, { valueAsNumber: true })}
              className={cn({ "border-red-500": errors.dealer_price })}
            />
          </div>

          {/* quantity */}
          {type === "create" && (
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                placeholder="Enter quantity"
                {...register(`quantity`, { valueAsNumber: true })}
                className={cn({ "border-red-500": errors.quantity })}
              />
            </div>
          )}

          {/* description */}
          <div className="col-span-full space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className={cn({ "border-red-500": errors.description })}
              placeholder="Enter description"
            />
          </div>

          {/* video_link */}
          <div className="col-span-full space-y-2">
            <Label htmlFor="video_link">Video link</Label>
            <Input
              id="video_link"
              {...register("video_link")}
              className={cn({ "border-red-500": errors.video_link })}
              placeholder="Enter Video link"
            />
          </div>
        </div>

        {/* chassis numbers */}
        {type === "create" && quantity > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Chassis Numbers</h3>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
              {Array.from({ length: quantity }, (_, index) => (
                <div key={index} className="space-y-2">
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
                  {/* {errors?.chassis_numbers?.[index]?.number && (
                      <p className="text-sm text-red-500">
                        {errors.chassis_numbers[index].number.message}
                      </p>
                    )} */}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* pricing */}
        {/* <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing</h3>
          <div className="border-input space-y-2 rounded-md border p-4">
            {pricingFields.map((field, index) => (
              <PricingItem
                key={index}
                index={index}
                removePricing={removePricing}
                showStateDeleteButton={pricingFields.length > 1}
              />
            ))}
          </div>

          <Button
            type="button"
            size="sm"
            variant={"outline"}
            onClick={() =>
              appendPricing({
                id: "",
                name: "",
                base_price: "",
                cities: [],
              })
            }
            className="mt-2"
          >
            <Plus className="h-4 w-4" /> Add State
          </Button>
        </div> */}

        {/* emi calculator */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">EMI Calculator</h3>
          <EMICalculator />
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Features</h3>
          <Features />
        </div>

        {/* specification */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Specification</h3>
          <Specifications />
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

function PricingItem({ index, removePricing, showStateDeleteButton }) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();
  const {
    fields: cityFields,
    append: appendCity,
    remove: removeCity,
  } = useFieldArray({ control, name: `pricing.${index}.cities` });

  return (
    <div className="border-input space-y-2 rounded-md border p-4">
      <div className="grid grid-cols-3 gap-4">
        <Input
          placeholder="State Name"
          {...register(`pricing.${index}.name`)}
          className={cn({
            "border-red-500": errors?.pricing?.[index]?.name,
          })}
        />
        <Input
          type="number"
          placeholder="Base Price"
          {...register(`pricing.${index}.base_price`, {
            valueAsNumber: true,
          })}
          className={cn({
            "border-red-500": errors?.pricing?.[index]?.base_price,
          })}
        />
      </div>

      <div className="mt-4 space-y-2">
        <h4 className="font-medium">Cities</h4>
        {cityFields.map((city, cityIndex) => (
          <div
            key={city.id}
            className="border-muted grid grid-cols-4 items-center gap-4 rounded border p-2"
          >
            <Input
              placeholder="City Name"
              {...register(`pricing.${index}.cities.${cityIndex}.name`)}
              className={cn({
                "border-red-500":
                  errors?.pricing?.[index]?.cities?.[cityIndex]?.name,
              })}
            />
            <Input
              type="number"
              placeholder="Price Modifier"
              {...register(
                `pricing.${index}.cities.${cityIndex}.price_modifier`,
                { valueAsNumber: true },
              )}
              className={cn({
                "border-red-500":
                  errors?.pricing?.[index]?.cities?.[cityIndex]?.price_modifier,
              })}
            />
            <Button
              variant="destructive"
              type="button"
              size="icon"
              onClick={() => removeCity(cityIndex)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          size="sm"
          onClick={() => appendCity({ id: "", name: "", price_modifier: "" })}
          className="mt-2"
          variant={"outline"}
        >
          <Plus className="h-4 w-4" /> Add City
        </Button>
      </div>

      {showStateDeleteButton && (
        <div className="pt-2 text-right">
          <Button
            variant="destructive"
            type="button"
            size="icon"
            onClick={() => removePricing(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
