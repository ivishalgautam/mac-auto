"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useGetVehicles } from "@/mutations/vehicle-mutation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import config from "@/config";
import {
  useCreateOrder,
  useOrder,
  useOrderItems,
  useUpdateOrder,
} from "@/mutations/use-orders";
import { useAuth } from "@/providers/auth-provider";
import DealerSelect from "@/features/dealer-select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { H3 } from "@/components/ui/typography";
import { ROLES } from "@/data/routes";
import Loader from "../loader";
import ErrorMessage from "../ui/error";

// --- Schema ---
const orderItemSchema = z.object({
  vehicle_id: z.string().uuid({ message: "Invalid vehicle_id" }),
  battery_type: z
    .string()
    .min(1, { message: "Battery type is required" })
    .max(100, { message: "Battery type too long" }),
  colors: z
    .array(
      z.object({
        color: z.string().min(1, { message: "Color is required" }),
        quantity: z
          .number({
            required_error: "Quantity is required",
            invalid_type_error: "Quantity must be a number",
          })
          .int()
          .positive({ message: "Quantity must be greater than 0" }),
      }),
    )
    .min(1, { message: "At least one color is required" }),
});

const createOrderSchema = z.object({
  dealer_id: z.string().uuid({ message: "Invalid dealer_id" }).optional(),
  oc_number: z.string().min(1, "OC Number is required*"),
  message: z.string().max(500, "Message too long").optional(),
  order_items: z
    .array(orderItemSchema)
    .min(1, { message: "At least one order item is required" }),
});

export const CATEGORIES = [
  { value: "passenger", label: "Passenger" },
  // { value: "cargo", label: "Cargo" },
  { value: "garbage", label: "Garbage" },
  { value: "loader", label: "Loader" },
  { value: "e-cycle", label: "E-Cycle" },
  // { value: "e-scooter", label: "E-Scooter" },
  { value: "golf", label: "Golf" },
];

const COLORS = ["Red", "Blue", "Black", "White", "Green"];
const BATTERY_TYPES = ["Lithium-ion", "Lead Acid"];

export default function OrderStepperForm({ type, id }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [batteryType, setBatteryType] = useState("");
  const router = useRouter();

  const { data: vehicles, isLoading: isVehiclesLoading } =
    useGetVehicles("page=1");

  const {
    data: orderData,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useOrder(id);
  const { data, isLoading, isError, error } = useOrderItems(id);

  const form = useForm({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      order_items: [],
      oc_number: "",
      message: "",
    },
  });

  const {
    control,
    setValue,
    handleSubmit,
    watch,
    register,
    formState: { errors },
    reset,
  } = form;
  const { fields } = useFieldArray({
    control,
    name: "order_items",
  });
  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);
  const handleNextWithValidation = () => {
    setStepError(""); // reset previous error
    switch (step) {
      case 1: // Category
        if (!selectedCategory.length) {
          setStepError("Please select a category");
          return;
        }
        break;
      case 2:
        if (selectedVehicles.length === 0) {
          setStepError("Please select at least one vehicle");
          return;
        }
        break;
      case 3:
        if (!batteryType) {
          setStepError("Please select battery type");
          return;
        }
        break;
      case 4:
        const allColorsValid = fields.every(
          (f, i) => (watch(`order_items.${i}.colors`) || []).length > 0,
        );
        if (!allColorsValid) {
          setStepError("Please select at least one color for each vehicle");
          return;
        }
        break;
      case 6:
        if (!watch("oc_number")) {
          setStepError("OC Number is required*");
          return;
        }
        break;
      case 7:
        if (user?.role === "admin" && !watch("dealer_id")) {
          setStepError("Please select a dealer");
          return;
        }
        break;
      default:
        break;
    }

    handleNext();
  };

  const filteredVehicles = useMemo(() => {
    if (!vehicles) return [];
    return (
      vehicles?.vehicles?.filter((v) =>
        selectedCategory.includes(v.category),
      ) ?? []
    );
  }, [vehicles, selectedCategory]);

  const groupedVehicles = useMemo(() => {
    return !filteredVehicles ? Object.groupBy(filteredVehicles, ({ category }) => category) ?? {} : {};
  }, [filteredVehicles]);

  const createMutation = useCreateOrder(() => {
    router.push("/orders?page=1&limit=10");
  });

  const updateMutation = useUpdateOrder(id, () => {
    router.push("/orders?page=1&limit=10");
  });

  const onSubmit = (data) => {
    if (user?.role === "admin" && !watch("dealer_id")) {
      setStepError("Please select a dealer");
      return;
    }

    type === "create"
      ? createMutation.mutate(data)
      : updateMutation.mutate(data);
  };

  const StepCategory = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-4">
        {CATEGORIES.map((c) => (
          <Card
            key={c.value}
            onClick={() => {
              setSelectedCategory((prev) => [...prev, c.value]);
            }}
            className={cn(
              "hover:border-primary cursor-pointer transition-all",
              selectedCategory.includes(c.value) &&
                "border-primary bg-primary/10",
            )}
          >
            <CardHeader>{c.label}</CardHeader>
          </Card>
        ))}
      </div>
      {stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack} disabled>
          Back
        </Button>
        <Button onClick={handleNextWithValidation}>Next</Button>
      </div>
    </div>
  );

  const StepVehicle = () => (
    <div className="space-y-4">
      {isVehiclesLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="text-muted-foreground animate-spin" />
        </div>
      ) : (
        <>
          <div className="space-y-4 divide-y-2">
            {(() => {
              const categories = Object.keys(groupedVehicles);
              return categories.length
                ? categories.map((cat) => {
                    return (
                      <div className="space-y-2" key={cat}>
                        <H3>{cat}</H3>
                        <div className="grid grid-cols-2 gap-4 pb-6">
                          {groupedVehicles[cat]?.length
                            ? groupedVehicles[cat].map((v) => {
                                const selected = selectedVehicles.includes(
                                  v.id,
                                );
                                return (
                                  <Card
                                    key={v.id}
                                    onClick={() => {
                                      setSelectedVehicles((prev) =>
                                        selected
                                          ? prev.filter((x) => x !== v.id)
                                          : [...prev, v.id],
                                      );
                                    }}
                                    className={cn(
                                      "relative cursor-pointer p-4 transition-all",
                                      selected
                                        ? "border-primary bg-primary/10"
                                        : "border-muted",
                                    )}
                                  >
                                    <figure>
                                      <Image
                                        src={config.file_base + v.carousel[0]}
                                        width={200}
                                        height={200}
                                        alt={v.title}
                                        className="mx-auto aspect-square"
                                      />
                                    </figure>
                                    <div className="text-center">
                                      <span>{v.title}</span>
                                    </div>
                                    {selected && (
                                      <Check className="absolute top-4 right-4 h-5 w-5 text-green-600" />
                                    )}
                                  </Card>
                                );
                              })
                            : "Products not found!"}
                        </div>
                      </div>
                    );
                  })
                : "Please selact atleast 1 category!";
            })()}
          </div>
          {stepError && (
            <p className="mt-2 text-sm text-red-600">{stepError}</p>
          )}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button
              disabled={selectedVehicles.length === 0}
              onClick={() => handleNextWithValidation()}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );

  const StepBatteryType = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {BATTERY_TYPES.map((b) => (
          <Badge
            key={b}
            onClick={() => setBatteryType(b)}
            className={cn(
              "text-foreground cursor-pointer px-4 py-2 text-sm",
              batteryType === b
                ? "bg-primary text-primary-foreground"
                : "bg-muted",
            )}
          >
            {b}
          </Badge>
        ))}
      </div>
      {stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button
          disabled={!batteryType}
          onClick={() => {
            type === "create" &&
              setValue(
                "order_items",
                selectedVehicles.map((v) => ({
                  vehicle_id: v,
                  battery_type: batteryType,
                  // color: "",
                  quantity: 1,
                })),
              );
            handleNextWithValidation();
          }}
        >
          Next
        </Button>
      </div>
    </div>
  );
  const StepColor = () => (
    <div className="space-y-6">
      {fields.map((field, i) => {
        const vehicle = filteredVehicles.find((v) => v.id === field.vehicle_id);
        const colorFields = watch(`order_items.${i}.colors`) || [];
        console.log({ fields, items: watch("order_items") });
        // console.log({ colorFields });

        const toggleColor = (color) => {
          const current = [...colorFields];
          const index = current.findIndex((c) => c.color === color);
          if (index > -1) {
            // remove color
            current.splice(index, 1);
          } else {
            // add new color with default qty 1
            current.push({ color, quantity: 1 });
          }
          setValue(`order_items.${i}.colors`, current);
        };

        const updateQty = (color, qty) => {
          const updated = colorFields.map((c) =>
            c.color === color ? { ...c, quantity: Number(qty) } : c,
          );
          setValue(`order_items.${i}.colors`, updated);
        };

        return (
          <Card key={field.id} className="p-4">
            <div className="mb-4 text-lg font-medium">{vehicle?.title}</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {COLORS.map((c) => {
                const selected = colorFields.some((x) => x.color === c);
                const currentQty =
                  colorFields.find((x) => x.color === c)?.quantity || 1;

                return (
                  <div
                    key={c}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border p-3 transition-all",
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-primary/40",
                    )}
                    onClick={() => toggleColor(c)}
                  >
                    <div
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: c }}
                    ></div>
                    <span className="text-sm">{c}</span>

                    {selected && (
                      <Input
                        type="number"
                        min={1}
                        value={currentQty}
                        onClick={(e) => e.stopPropagation()} // prevent toggle when adjusting qty
                        onChange={(e) => updateQty(c, e.target.value)}
                        className="w-20 text-center text-sm"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}

      {stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNextWithValidation}>Next</Button>
      </div>
    </div>
  );

  const StepMessage = () => (
    <div className="space-y-4">
      <Label className="font-medium">Message or Customization Request</Label>
      <Textarea
        {...register("message")}
        placeholder="Enter special instructions or customization details..."
      />
      {stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        <Button onClick={handleNextWithValidation}>Next</Button>
      </div>
    </div>
  );

  const StepOCNumber = () => (
    <div className="space-y-4">
      <Label className="font-medium">OC Number*</Label>
      <Input
        {...register("oc_number")}
        placeholder="Enter OC number"
        className={cn({ "border-destructive": errors.oc_number })}
      />
      {stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
        {[ROLES.CRE, ROLES.MANAGER, ROLES.ADMIN].includes(user.role) ? (
          <Button onClick={handleNextWithValidation}>Next</Button>
        ) : (
          <Button
            disabled={createMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        )}
      </div>
    </div>
  );

  const StepDealer = () => {
    // you can fetch dealers using a hook if needed
    return (
      <div className="space-y-4">
        <Label className="font-medium">Select Dealer</Label>
        <div className="grid grid-cols-2 gap-4">
          <DealerSelect
            onChange={(value) => setValue("dealer_id", value)}
            value={watch("dealer_id")}
          />
        </div>
        {stepError && <p className="mt-2 text-sm text-red-600">{stepError}</p>}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
          <Button
            disabled={createMutation.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {createMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Submit
          </Button>
        </div>
      </div>
    );
  };

  const steps = useMemo(() => {
    const baseSteps = [
      "Category",
      "Vehicle",
      "Battery",
      "Color",
      "Message",
      "OC Number",
    ];
    if (user?.role === "admin") baseSteps.push("Dealer");
    return baseSteps;
  }, [user]);

  useEffect(() => {
    if (type === "edit" && data && orderData) {
      reset((prev) => {
        return {
          ...prev,
          dealer_id: orderData.dealer_id,
          message: orderData?.message ?? "",
          order_items: data?.items?.map((item) => {
            const colors = item.colors.map((c) => ({
              color: c.color,
              quantity: parseInt(c.quantity),
            }));
            // console.log({ colors });
            return {
              battery_type: item.battery_type,
              colors: colors,
              vehicle_id: item.vehicle_id,
            };
          }),
        };
      });
      setSelectedCategory(data?.items?.map(({ category }) => category) ?? []);
      setSelectedVehicles(
        data?.items?.map(({ vehicle_id }) => vehicle_id) ?? [],
      );
      setBatteryType(data?.items?.[0]?.battery_type);
    }
  }, [type, data, orderData, reset, setSelectedCategory, setSelectedVehicles]);

  if (type === "edit" && (isLoading || isOrderLoading)) return <Loader />;
  if (type === "edit" && (isError || isOrderError))
    return <ErrorMessage error={error || orderError} />;
  return (
    <div>
      <Card className="mx-auto max-w-3xl p-6">
        <CardHeader>
          <h2 className="mb-2 text-xl font-semibold">Create Order</h2>
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-1 w-8 rounded",
                  step > index ? "bg-primary" : "bg-muted-foreground",
                )}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && <StepCategory />}
          {step === 2 && <StepVehicle />}
          {step === 3 && <StepBatteryType />}
          {step === 4 && <StepColor />}
          {step === 5 && <StepMessage />}
          {step === 6 && <StepOCNumber />}
          {step === 7 && user?.role === "admin" && <StepDealer />}
        </CardContent>
      </Card>
    </div>
  );
}
