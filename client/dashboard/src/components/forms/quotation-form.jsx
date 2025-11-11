"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateQuotation,
  useGetQuotation,
  useUpdateQuotation,
} from "@/mutations/quotation-mutation";
import VehicleSelect from "@/features/vehicle-select";
import VehicleVariantMapSelect from "@/features/vehicle-variant-map-select";
import VehicleColorSelect from "@/features/vehicle-color-select";
import { DatePicker } from "../ui/date-picker";
import { H4 } from "../ui/typography";
import {
  useGetFormattedWalkInEnquiries,
  useGetWalkInEnquiries,
  useGetWalkInEnquiry,
} from "@/mutations/walkin-enquiries-mutation";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { useEffect } from "react";
import PhoneSelect from "../ui/phone-input";
import { cn } from "@/lib/utils";
import { useGetVehicle } from "@/mutations/vehicle-mutation";
import CustomCommandMenu from "../custom-command-menu";
import moment from "moment";

const defaultValues = {
  customer_name: "",
  mobile_no: "",
  date: null,
  //   model: "",
  //   variant: "",
  //   colour: "",
  base_price_ex_showroom: "",
  gst: 5,
  insurance: "",
  rto_registration_charges: "",
  accessories_fitments: "",
  total_ex_showroom_price: "",
  discount: "",
  on_road_price: "",
};

const createSchema = z.object({
  enquiry_id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  vehicle_variant_map_id: z.string().uuid(),
  vehicle_color_id: z.string().uuid(),
  enquiry_id: z.string().uuid(),
  customer_name: z.string().min(1, "Customer name is required"),
  mobile_no: z.string().min(10, "Enter valid mobile no."),
  date: z.union([z.date(), z.null()]).default(null),
  model: z.string().optional(),
  variant: z.string().optional(),
  colour: z.string().optional(),
  base_price_ex_showroom: z.string().optional(),
  gst: z.coerce.number().optional(),
  insurance: z.string().min(1, { message: "Insurance is required." }),
  rto_registration_charges: z
    .string()
    .min(1, { message: "RTO registration charges is required." }),
  accessories_fitments: z.string().optional(),
  total_ex_showroom_price: z.string().optional(),
  discount: z.string().optional(),
  on_road_price: z.string().optional(),
});

export default function QuotationForm({
  type = "create",
  id,
  callback = null,
  enquiryId,
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { ...defaultValues, enquiry_id: enquiryId ?? null },
  });

  const basePrice = watch("base_price_ex_showroom") || "0";
  const gst = watch("gst") || "0";
  const insurance = watch("insurance") || "0";
  const rto = watch("rto_registration_charges") || "0";
  const accessories = watch("accessories_fitments") || "0";
  const discount = watch("discount") || "0";

  const {
    data: enquiriesData,
    isLoading: isEnquiriesLoading,
    isError: isEnquiriesError,
    error: enquiriesError,
  } = useGetFormattedWalkInEnquiries("enqt=mac-auto.walk-in");

  const {
    data: enquiryData,
    isLoading: isEnquiryLoading,
    isError: isEnquiryError,
    error: enquiryError,
  } = useGetWalkInEnquiry(watch("enquiry_id"));
  const {
    data: vehicleData,
    isLoading: isVehicleLoading,
    isError: isVehicleError,
    error: vehicleError,
  } = useGetVehicle(enquiryData?.vehicle_id);
  const createMutation = useCreateQuotation(() => {
    reset({});
    router.back();
  });
  const { data, isLoading, isError, error } = useGetQuotation(id);
  const updateMutation = useUpdateQuotation(id, () => {
    reset({});
    router.back();
  });

  const onSubmit = (data) => {
    console.log({});
    type === "create"
      ? createMutation.mutate({ ...data, date: moment(data.date).format() })
      : updateMutation.mutate({ ...data, date: moment(data.date).format() });
  };

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  useEffect(() => {
    const bp = parseFloat(basePrice) || 0;
    const gstPercent = parseFloat(gst) || 0;
    const ins = parseFloat(insurance) || 0;
    const rtoVal = parseFloat(rto) || 0;
    const acc = parseFloat(accessories) || 0;
    const disc = parseFloat(discount) || 0;

    // GST as percentage
    const gstValue = (bp * gstPercent) / 100;

    const totalExShowroom = bp + gstValue + ins + rtoVal + acc;
    const onRoad = totalExShowroom - disc;

    reset((prev) => ({
      ...prev,
      total_ex_showroom_price: totalExShowroom.toFixed(2).toString(),
      on_road_price: onRoad.toFixed(2).toString(),
    }));
  }, [basePrice, gst, insurance, rto, accessories, discount, reset]);

  useEffect(() => {
    if (enquiryData) {
      reset((prev) => ({
        ...prev,
        customer_name: enquiryData.name,
        mobile_no: enquiryData.phone,
        vehicle_id: enquiryData.vehicle_id,
      }));
    }
  }, [enquiryData, reset]);

  useEffect(() => {
    if (type !== "edit" && vehicleData) {
      reset((prev) => ({
        ...prev,
        base_price_ex_showroom: vehicleData.base_price,
      }));
    }
  }, [vehicleData, reset]);

  useEffect(() => {
    if (data) {
      reset({ ...data });
    }
  }, [data, reset]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="max-w-lg space-y-2">
        <Label htmlFor="enquiry_id">Enquiry</Label>
        <Controller
          name="enquiry_id"
          control={control}
          render={({ field }) => {
            return (
              <CustomCommandMenu
                key={"enquiry_id"}
                onChange={field.onChange}
                value={field.value}
                data={enquiriesData}
                isLoading={isEnquiriesLoading}
                isError={isEnquiriesError}
                error={enquiriesError}
                searchPlaceholder="Select enquiry"
              />
            );
          }}
        />
        {errors.enquiry_id && (
          <p className="text-destructive text-sm">
            {errors.enquiry_id.message}
          </p>
        )}
      </div>

      {watch("enquiry_id") &&
        (isEnquiryLoading ? (
          <Loader />
        ) : isEnquiryError ? (
          <ErrorMessage error={enquiryError} />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Customer Name */}
            <div className="space-y-2">
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input id="customer_name" {...register("customer_name")} />
              {errors.customer_name && (
                <p className="text-destructive text-sm">
                  {errors.customer_name.message}
                </p>
              )}
            </div>

            {/* Mobile No */}
            <div className="space-y-2">
              <Label htmlFor="mobile_no">Mobile No</Label>
              <Controller
                control={control}
                name="mobile_no"
                render={({ field }) => (
                  <PhoneSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter mobile number"
                    className={cn({
                      "border border-red-500": errors.mobile_no,
                    })}
                  />
                )}
              />
              {errors.mobile_no && (
                <p className="text-destructive text-sm">
                  {errors.mobile_no.message}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => {
                  return (
                    <DatePicker
                      key={"date"}
                      onChange={field.onChange}
                      value={field.value}
                    />
                  );
                }}
              />
            </div>

            {/* Model */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Model</Label>
              <Controller
                name="vehicle_id"
                control={control}
                render={({ field }) => {
                  return (
                    <VehicleSelect
                      onChange={field.onChange}
                      value={field.value}
                    />
                  );
                }}
              />
            </div>

            {/* Variant */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_variant_map_id">Variant</Label>
              <Controller
                name="vehicle_variant_map_id"
                control={control}
                render={({ field }) => {
                  return (
                    <VehicleVariantMapSelect
                      onChange={field.onChange}
                      value={field.value}
                      vehicleId={watch("vehicle_id")}
                    />
                  );
                }}
              />
              {errors.vehicle_variant_map_id && (
                <p className="text-destructive text-sm">
                  {errors.vehicle_variant_map_id.message}
                </p>
              )}
            </div>

            {/* Colour */}
            <div className="space-y-2">
              <Label htmlFor="vehicle_color_id">Colour</Label>
              <Controller
                name="vehicle_color_id"
                control={control}
                render={({ field }) => {
                  return (
                    <VehicleColorSelect
                      onChange={field.onChange}
                      value={field.value}
                      vehicleId={watch("vehicle_id")}
                    />
                  );
                }}
              />
              {errors.vehicle_color_id && (
                <p className="text-destructive text-sm">
                  {errors.vehicle_color_id.message}
                </p>
              )}
            </div>

            {/* Pricing Fields */}
            <div className="col-span-full mt-10 space-y-6">
              <H4>Price breakup</H4>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label>Base Price</Label>
                  <Input
                    type="number"
                    {...register("base_price_ex_showroom")}
                  />
                  {errors.base_price_ex_showroom && (
                    <p className="text-destructive text-sm">
                      {errors.base_price_ex_showroom.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>GST (%)</Label>
                  <Input type="number" {...register("gst")} />
                  {errors.gst && (
                    <p className="text-destructive text-sm">
                      {errors.gst.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Insurance</Label>
                  <Input type="number" {...register("insurance")} />
                  {errors.insurance && (
                    <p className="text-destructive text-sm">
                      {errors.insurance.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>RTO Charges</Label>
                  <Input
                    type="number"
                    {...register("rto_registration_charges")}
                  />
                  {errors.rto_registration_charges && (
                    <p className="text-destructive text-sm">
                      {errors.rto_registration_charges.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Accessories/Fitments</Label>
                  <Input type="number" {...register("accessories_fitments")} />
                </div>
                <div>
                  <Label>Total Ex-Showroom</Label>
                  <Input
                    type="number"
                    {...register("total_ex_showroom_price")}
                    disabled
                  />
                </div>
                <div>
                  <Label>Discount</Label>
                  <Input type="number" {...register("discount")} />
                </div>
                <div>
                  <Label>On Road Price</Label>
                  <Input
                    type="number"
                    {...register("on_road_price")}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {type === "create" ? "Create Quotation" : "Update Quotation"}
        </Button>
      </div>
    </form>
  );
}
