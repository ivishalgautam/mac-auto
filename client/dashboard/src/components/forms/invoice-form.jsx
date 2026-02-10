"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "../ui/date-picker";
import { H4, H5 } from "../ui/typography";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import moment from "moment";
import CustomMultiSelect from "../custom-multi-select";
import {
  useCreateInvoice,
  useGetInvoice,
  useUpdateInvoice,
} from "@/mutations/invoices-mutation";
import CustomerSelect from "@/features/customer-select";
import { useGetFormattedAvailableVehicles } from "@/mutations/dealer-inventory.mutation";

const defaultValues = {
  customer_name: "",
  mobile_no: "",
  date: null,
  //   model: "",
  //   variant: "",
  //   colour: "",
  vehicle_price_breakups: [
    // {
    //   model: "",
    //   base_price_ex_showroom: "",
    //   gst: 5,
    //   insurance: "",
    //   rto_registration_charges: "",
    //   accessories_fitments: "",
    //   total_ex_showroom_price: "",
    //   discount: "",
    //   on_road_price: "",
    // },
  ],
};

const createSchema = z.object({
  // enquiry_id: z.string().uuid().optional(),
  customer_id: z
    .string()
    .uuid({ message: "Invalid customer ID" })
    .min(1, { message: "Select customer" }),
  vehicle_ids: z
    .array(
      z.object({
        value: z.string().uuid({ message: "Invalid vehicle" }),
        label: z.string(),
      }),
    )
    .min(1, { message: "Select vehicle" })
    .transform((data) => data.map(({ value }) => value))
    .default([]),
  // customer_name: z.string().min(1, "Customer name is required"),
  // mobile_no: z.string().min(10, "Enter valid mobile no."),
  date: z.union([z.date(), z.null()]).default(null),
  vehicle_price_breakups: z.array(
    z.object({
      model: z.string().optional(),
      base_price_ex_showroom: z.string().default(0),
      gst: z.coerce.number().default(0),
      insurance: z.string().min(1, { message: "Insurance is required." }),
      rto_registration_charges: z
        .string()
        .min(1, { message: "RTO registration charges is required." }),
      accessories_fitments: z.string().default(0),
      total_ex_showroom_price: z.string().default(0),
      discount: z.string().default(0),
      on_road_price: z.string().default(0),
    }),
  ),
  message: z.string().optional(),
});

export default function InvoiceForm({ type = "create", id, callback = null }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    watch,
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(createSchema),
    defaultValues: { ...defaultValues },
  });
  const selectedVehicles = watch("vehicle_ids");

  const watchPriceBreakUps = useWatch({
    control,
    name: "vehicle_price_breakups",
  });

  const { fields: priceBreakUps } = useFieldArray({
    name: "vehicle_price_breakups",
    control,
  });
  const {
    data: vehiclesData,
    isLoading: isVehiclesLoading,
    isError: isVehiclesError,
    error: vehiclesError,
  } = useGetFormattedAvailableVehicles("");

  // const {
  //   data: vehiclesData,
  //   isLoading: isVehiclesLoading,
  //   isError: isVehiclesError,
  //   error: vehiclesError,
  // } = useGetVehicles();

  const formattedVehiclesData = useMemo(() => {
    return (
      vehiclesData?.map((vh) => ({
        value: vh.inventory_vehicle_id,
        label: `${vh.title} (${vh.color_name}) (${vh.chassis_no})`,
      })) ?? []
    );
  }, [vehiclesData]);

  const createMutation = useCreateInvoice(() => {
    reset({});
    router.back();
  });
  const { data, isLoading, isError, error } = useGetInvoice(id);
  const updateMutation = useUpdateInvoice(id, () => {
    reset({});
    router.back();
  });

  const onSubmit = (data) => {
    type === "create"
      ? createMutation.mutate({
          ...data,
          date: data.date ? moment(data.date).format() : null,
        })
      : updateMutation.mutate({
          ...data,
          date: data.date ? moment(data.date).format() : null,
        });
  };

  const isFormPending =
    (type === "create" && createMutation.isPending) ||
    (type === "edit" && updateMutation.isPending);

  useEffect(() => {
    if (!watchPriceBreakUps) return;

    watchPriceBreakUps.forEach((pb, ind) => {
      const bp = parseFloat(pb.base_price_ex_showroom) || 0;
      const gstPercent = parseFloat(pb.gst) || 0;
      const ins = parseFloat(pb.insurance) || 0;
      const rtoVal = parseFloat(pb.rto_registration_charges) || 0;
      const acc = parseFloat(pb.accessories_fitments) || 0;
      const disc = parseFloat(pb.discount) || 0;

      const gstValue = (bp * gstPercent) / 100;
      const totalExShowroom = bp + gstValue + ins + rtoVal + acc;
      const onRoad = totalExShowroom - disc;

      if (pb.total_ex_showroom_price !== totalExShowroom.toFixed(2)) {
        setValue(
          `vehicle_price_breakups.${ind}.total_ex_showroom_price`,
          totalExShowroom.toFixed(2),
          { shouldValidate: false, shouldDirty: false },
        );
      }

      if (pb.on_road_price !== onRoad.toFixed(2)) {
        setValue(
          `vehicle_price_breakups.${ind}.on_road_price`,
          onRoad.toFixed(2),
          { shouldValidate: false, shouldDirty: false },
        );
      }
    });
  }, [watchPriceBreakUps]);

  useEffect(() => {
    if (type === "create" && vehiclesData && selectedVehicles) {
      const filteredVehicles = vehiclesData?.filter((v) =>
        selectedVehicles
          .map(({ value }) => value)
          .includes(v.inventory_vehicle_id),
      );

      const mapped = filteredVehicles.map((v) => ({
        model: `${v.title} (${v.color_name}) (${v.chassis_no})`,
        base_price_ex_showroom: v.base_price,
      }));

      setValue("vehicle_price_breakups", mapped);
    }
  }, [vehiclesData, type, selectedVehicles, setValue]);

  useEffect(() => {
    if (type === "edit" && data) {
      reset({
        ...data,
        vehicle_ids: formattedVehiclesData.filter(({ value }) =>
          data.vehicle_ids.includes(value),
        ),
        date: data.date ? new Date(data.date) : null,
      });
    }
  }, [data, reset, type, formattedVehiclesData]);

  if (type === "edit" && isLoading) return <Loader />;
  if (type === "edit" && isError) return <ErrorMessage error={error} />;
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* customer */}
        <div>
          <Label>Customer *</Label>
          <Controller
            name="customer_id"
            control={control}
            render={({ field }) => (
              <CustomerSelect
                value={field.value}
                onChange={field.onChange}
                // disabled={type === "edit"}
                className={cn({
                  "!border-destructive": errors.customer_id,
                })}
              />
            )}
          />
          {errors.customer_id && (
            <span className="text-destructive text-sm">
              {errors.customer_id.message}
            </span>
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
          {errors.date && (
            <span className="text-destructive text-sm">
              {errors.date.message}
            </span>
          )}
        </div>

        {/* vehicle */}
        <div className="col-span-full space-y-2">
          <Label>Models *</Label>
          <Controller
            name="vehicle_ids"
            control={control}
            render={({ field }) => (
              <CustomMultiSelect
                options={formattedVehiclesData}
                isLoading={isVehiclesLoading}
                isError={isVehiclesError}
                error={vehiclesError}
                async
                placeholder="Select vehicles"
                value={field.value}
                onChange={field.onChange}
                disabled={type === "edit"}
                className={cn({
                  "border-destructive": errors.vehicle_ids,
                })}
              />
            )}
          />
          {errors.vehicle_ids && (
            <span className="text-destructive text-sm">
              {errors.vehicle_ids.message}
            </span>
          )}
        </div>

        {/* Pricing Fields */}
        <div className="col-span-full mt-10 space-y-6">
          <H4>Price breakups</H4>
          <div className="space-y-8 divide-y">
            {priceBreakUps.map((pb, ind) => {
              return (
                <div className="space-y-3 pb-8 last:pb-0" key={ind}>
                  <H5 className={"text-primary"}>
                    {priceBreakUps?.[ind]?.model ?? "-"}
                  </H5>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <Label>Base Price</Label>
                      <Input
                        type="number"
                        {...register(
                          `vehicle_price_breakups.${ind}.base_price_ex_showroom`,
                        )}
                      />
                      {errors?.vehicle_price_breakups?.[ind]
                        ?.base_price_ex_showroom && (
                        <p className="text-destructive text-sm">
                          {
                            errors?.vehicle_price_breakups?.[ind]
                              ?.base_price_ex_showroom.message
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>GST (%)</Label>
                      <Input
                        type="number"
                        {...register(`vehicle_price_breakups.${ind}.gst`)}
                      />
                      {errors?.vehicle_price_breakups?.[ind]?.gst && (
                        <p className="text-destructive text-sm">
                          {errors?.vehicle_price_breakups?.[ind]?.gst.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Insurance*</Label>
                      <Input
                        type="number"
                        {...register(`vehicle_price_breakups.${ind}.insurance`)}
                      />
                      {errors?.vehicle_price_breakups?.[ind]?.insurance && (
                        <p className="text-destructive text-sm">
                          {
                            errors?.vehicle_price_breakups?.[ind]?.insurance
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>RTO Charges*</Label>
                      <Input
                        type="number"
                        {...register(
                          `vehicle_price_breakups.${ind}.rto_registration_charges`,
                        )}
                      />
                      {errors?.vehicle_price_breakups?.[ind]
                        ?.rto_registration_charges && (
                        <p className="text-destructive text-sm">
                          {
                            errors?.vehicle_price_breakups?.[ind]
                              ?.rto_registration_charges.message
                          }
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Accessories/Fitments</Label>
                      <Input
                        type="number"
                        {...register(
                          `vehicle_price_breakups.${ind}.accessories_fitments`,
                        )}
                      />
                    </div>
                    <div>
                      <Label>Total Ex-Showroom</Label>
                      <Input
                        type="number"
                        // value={pb.total_ex_showroom_price || ""}
                        {...register(
                          `vehicle_price_breakups.${ind}.total_ex_showroom_price`,
                        )}
                        disabled
                      />
                    </div>
                    <div>
                      <Label>Discount</Label>
                      <Input
                        type="number"
                        {...register(`vehicle_price_breakups.${ind}.discount`)}
                      />
                    </div>
                    <div>
                      <Label>On Road Price</Label>
                      <Input
                        type="number"
                        {...register(
                          `vehicle_price_breakups.${ind}.total_ex_showroom_price`,
                        )}
                        disabled
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="text-end">
        <Button type="submit" disabled={isFormPending}>
          {isFormPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {type === "create" ? "Create invoice" : "Update invoice"}
        </Button>
      </div>
    </form>
  );
}
