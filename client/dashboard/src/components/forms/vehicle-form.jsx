"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircleIcon, Plus, Trash } from "lucide-react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
} from "react-hook-form";
import { toast } from "sonner";
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
import { vehicleSchema } from "@/utils/schema/vehicle.schema";
import {
  useCreateVehicle,
  useGetVehicle,
  useUpdateVehicle,
} from "@/mutations/vehicle-mutation";
import { Textarea } from "../ui/textarea";
import ColorsSelect from "../colors-select";
import { useRouter } from "next/navigation";
import { colors } from "@/data";
import MultipleSelector from "../ui/multiselect";

const defaultValues = {
  category: "",
  title: "",
  description: "",
  slug: "",
  vehicle_id: null,
  is_variant: false,
  colors: [],
  pricing: [
    {
      id: "",
      name: "",
      base_price: "",
      cities: [],
    },
  ],
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
  const methods = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues,
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    control,
    reset,
  } = methods;
  const {
    fields: pricingFields,
    append: appendPricing,
    remove: removePricing,
  } = useFieldArray({ control, name: "pricing" });

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
    type === "create"
      ? createMutation.mutate(data)
      : updateMutation.mutate(data);
  };

  const formErrors = getFormErrors(errors);
  const hasErrors = formErrors.length > 0;
  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  useEffect(() => {
    if (type === "edit" && data) {
      console.log({ data });
      reset({ ...data });
    }
  }, [data, type, reset]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
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

          {/* description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              className={cn({ "border-red-500": errors.description })}
              placeholder="Enter description"
            />
          </div>
        </div>

        {/* colors */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Colors</h3>
          <Controller
            control={control}
            name="colors"
            render={({ field }) => (
              <MultipleSelector
                onChange={field.onChange}
                commandProps={{ label: "Select colors" }}
                value={field.value}
                defaultOptions={colors}
                placeholder="Select colors"
                hideClearAllButton={false}
                hidePlaceholderWhenSelected={false}
                emptyIndicator={
                  <p className="text-center text-sm">No results found</p>
                }
                className={cn({ "border-red-500": errors.colors })}
              />
            )}
          />
        </div>

        {/* pricing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pricing</h3>
          {pricingFields.map((field, index) => (
            <PricingItem
              key={index}
              index={index}
              removePricing={removePricing}
            />
          ))}

          <Button
            type="button"
            size="sm"
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
        </div>

        {/* emi calculator */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">EMI Calculator</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Default Down Payment</Label>
              <Input
                type="number"
                {...register("emi_calculator.default_values.down_payment", {
                  valueAsNumber: true,
                })}
                placeholder="Enter default down payment"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.default_values?.down_payment,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Loan Tenure</Label>
              <Input
                type="number"
                {...register("emi_calculator.default_values.loan_tenure", {
                  valueAsNumber: true,
                })}
                placeholder="Enter default loan tenure"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.default_values?.loan_tenure,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Default Interest Rate</Label>
              <Input
                type="number"
                step="0.01"
                {...register("emi_calculator.default_values.interest_rate", {
                  valueAsNumber: true,
                })}
                placeholder="Enter default interest rate"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.default_values?.interest_rate,
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Down Payment Min</Label>
              <Input
                type="number"
                {...register("emi_calculator.ranges.down_payment.min", {
                  valueAsNumber: true,
                })}
                placeholder="Enter min. down payment"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.ranges?.down_payment?.min,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Down Payment Step</Label>
              <Input
                type="number"
                {...register("emi_calculator.ranges.down_payment.step", {
                  valueAsNumber: true,
                })}
                placeholder="Enter down payment step"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.ranges.down_payment?.step,
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Tenure Min</Label>
              <Input
                type="number"
                {...register("emi_calculator.ranges.loan_tenure.min", {
                  valueAsNumber: true,
                })}
                placeholder="Enter min. tenure"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.ranges?.loan_tenure?.min,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tenure Max</Label>
              <Input
                type="number"
                {...register("emi_calculator.ranges.loan_tenure.max", {
                  valueAsNumber: true,
                })}
                placeholder="Enter max. tenure"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.ranges?.loan_tenure?.max,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tenure Step</Label>
              <Input
                type="number"
                {...register("emi_calculator.ranges.loan_tenure.step", {
                  valueAsNumber: true,
                })}
                placeholder="Enter tenure step"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.ranges?.loan_tenure?.step,
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Interest Min</Label>
              <Input
                type="number"
                {...register("emi_calculator.ranges.interest_rate.min", {
                  valueAsNumber: true,
                })}
                placeholder="Enter min. interest"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.ranges?.interest_rate?.min,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Interest Max</Label>
              <Input
                type="number"
                {...register("emi_calculator.ranges.interest_rate.max", {
                  valueAsNumber: true,
                })}
                placeholder="Enter max. interest"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.ranges?.interest_rate?.max,
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Interest Step</Label>
              <Input
                type="number"
                step="0.01"
                {...register("emi_calculator.ranges.interest_rate.step", {
                  valueAsNumber: true,
                })}
                placeholder="Enter interest step"
                className={cn({
                  "border-red-500":
                    errors?.emi_calculator?.ranges?.interest_rate?.step,
                })}
              />
            </div>
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

function PricingItem({ index, removePricing }) {
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
    <div className="space-y-2 rounded-md border p-4">
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
        >
          <Plus className="h-4 w-4" /> Add City
        </Button>
      </div>

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
    </div>
  );
}
