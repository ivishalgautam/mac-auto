"use client";

import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Button, buttonVariants } from "../ui/button";
import { Label } from "../ui/label";
import { useGetDealerOrdersChassisDetails } from "@/mutations/dealer-order-mutation";
import Loader from "../loader";
import ErrorMessage from "../ui/error";
import { H4 } from "../ui/typography";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, LoaderCircle, SquarePen } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { useEffect } from "react";
import {
  useCreatePDICheck,
  useGetPDICheck,
  useUpdatePDICheck,
} from "@/mutations/pdi-check-mutation";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PDICheckForm({ orderId, type = "create", id }) {
  const { register, handleSubmit, watch, control, setValue, reset } = useForm({
    defaultValues: {
      pdi: [],
      pdi_incharge: { pdi_date: new Date(), bill_no: "", remarks: "" },
    },
  });
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState(null);
  const { data, isLoading, isError, error } =
    useGetDealerOrdersChassisDetails(orderId);

  const createMutation = useCreatePDICheck(orderId, () => router.back());
  const updateMutation = useUpdatePDICheck(id);
  const {
    data: pdiData,
    isLoading: isPdiDataLoading,
    isError: isPdiDataError,
    error: pdiDataError,
  } = useGetPDICheck(id);

  const onSubmit = (data) => {
    setResult(data);
    type === "edit" ? updateMutation.mutate(data) : createMutation.mutate(data);
  };
  const { fields } = useFieldArray({ control, name: "pdi" });
  useEffect(() => {
    if (data) {
      const formData = data.map((item) => {
        return {
          pdi_check: { ...pdiFormValue },
          chassis_no: item.chassis_no,
          motor_no: item.motor_no,
          battery_no: item.battery_no,
          controller_no: item.controller_no,
          charger_no: item.charger_no,
          color: item.color,
          vehicle_title: item.vehicle_title,
        };
      });
      setValue("pdi", formData);
    }
  }, [data, setValue]);

  useEffect(() => {
    if (["view", "edit"].includes(type) && pdiData) {
      reset({ pdi: pdiData.pdi, pdi_incharge: pdiData.pdi_incharge });
    }
  }, [pdiData, reset, type]);

  const isButtonPending =
    (type === "edit" && updateMutation.isPending) ||
    (type === "create" && createMutation.isPending);

  if (
    (type === "create" && isLoading) ||
    (["edit", "view"].includes(type) && isPdiDataLoading)
  )
    return <Loader />;

  if (
    (type === "create" && isError) ||
    (["edit", "view"].includes(type) && isPdiDataError)
  )
    return <ErrorMessage error={error || pdiDataError} />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="divide-input space-y-6">
        {type === "view" && (
          <div className="text-end">
            <Link href="edit" className={buttonVariants({})}>
              <SquarePen className="size-4" /> Edit
            </Link>
          </div>
        )}

        <div className="space-y-6">
          {fields.map((item, idx) => (
            <div
              key={item.chassis_no}
              className="space-y-6 rounded-lg border p-6"
            >
              <div>
                <h2 className="text-lg font-bold capitalize">
                  Vehicle details
                </h2>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                  <div>
                    <Label>Chassis No.</Label>
                    <Input {...register(`pdi.${idx}.chassis_no`)} disabled />
                  </div>
                  <div>
                    <Label>Motor No.</Label>
                    <Input {...register(`pdi.${idx}.motor_no`)} disabled />
                  </div>
                  <div>
                    <Label>Battery No.</Label>
                    <Input {...register(`pdi.${idx}.battery_no`)} disabled />
                  </div>
                  <div>
                    <Label>PDI No.</Label>
                    <Input {...register(`pdi.${idx}.pdi_no`)} disabled />
                  </div>
                  <div>
                    <Label>PDI Date.</Label>
                    <Input
                      {...register(`pdi.${idx}.pdi_datemotor_no`)}
                      disabled
                    />
                  </div>
                  <div>
                    <Label>Colour</Label>
                    <div
                      className="size-9 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <div>
                    <Label>Controller No.</Label>
                    <Input {...register(`pdi.${idx}.controller_no`)} disabled />
                  </div>
                  <div>
                    <Label>Charger No.</Label>
                    <Input {...register(`pdi.${idx}.charger_no`)} disabled />
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(item.pdi_check).map(([group, items]) => (
                  <div key={group} className="space-y-2">
                    <h2 className="text-lg font-bold capitalize">
                      {group.replace(/([A-Z])/g, " $1")}
                    </h2>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                      {Object.entries(items).map(([item, value]) => (
                        <Label
                          key={item}
                          className={cn(
                            "hover:bg-accent/50 border-input flex items-center gap-2 rounded-lg border p-2 px-3 has-[[aria-checked=true]]:border-blue-600 has-[[aria-checked=true]]:bg-blue-50 dark:has-[[aria-checked=true]]:border-blue-900 dark:has-[[aria-checked=true]]:bg-blue-950",
                            {
                              "cursor-not-allowed": type === "view",
                            },
                          )}
                        >
                          <Controller
                            control={control}
                            name={`pdi.${idx}.pdi_check.${group}.${item}`}
                            render={({ field }) => (
                              <Checkbox
                                onCheckedChange={field.onChange}
                                checked={field.value}
                                disabled={type === "view"}
                              />
                            )}
                          />
                          <span className="capitalize">{item}</span>
                        </Label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2 className="text-lg font-bold capitalize">PDI Incharge</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
            <div>
              <Label>Bill No.</Label>
              <Input
                {...register("pdi_incharge.bill_no")}
                placeholder="Enter bill no."
                disabled={type === "view"}
              />
            </div>

            <div>
              <Label>Bill date</Label>
              <Controller
                control={control}
                name="pdi_incharge.bill_date"
                render={({ field }) => (
                  <div>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild disabled={type === "view"}>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "h-10 w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(value) => {
                            field.onChange(value);
                            setOpen(false);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              />
            </div>

            <div className="col-span-2">
              <Label>Remarks</Label>
              <Textarea
                {...register("pdi_incharge.remarks")}
                placeholder="Enter remarks"
                disabled={type === "view"}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="text-end">
        <Button type="submit" disabled={isButtonPending}>
          {isButtonPending && <LoaderCircle className="size-4 animate-spin" />}
          Submit
        </Button>
      </div>
    </form>
  );
}

export const pdiFormValue = {
  electricalSystems: {
    connections: false,
    "power on/off switch": false,
    "power on": false,
    "speedo meter": false,
    display: false,
    "indicator left": false,
    "indicator right": false,
    stopper: false,
    "brake indication": false,
    "other indications": false,
    motor: false,
    "head light": false,
    "tail light": false,
    "indicator flasher front": false,
    "indicator flasher rear": false,
    "indicator buzzer": false,
    horn: false,
    "brake cut system": false,
    "security/alarm system": false,
    battery: false,
    charger: false,
    "on-off key 2 nos": false,
    "side stand sensor": false,
    "all switch functions": false,
    "voltage connections": false,
    "limit connections": false,
    "controller health": false,
    "converter health": false,
    "wiring health": false,
    "motor with wiper": false,
  },
  mechanicalSystems: {
    "plastic body parts fixation": false,
    "tyre direction": false,
    "tyre pressure front": false,
    "tyre pressure rear": false,
    "seat lock": false,
    "throttle & left grip fittings": false,
    "front & rear brake": false,
    "motor unit performance": false,
    "front direction": false,
    "rear direction": false,
    stickers: false,
    "paint/marks": false,
    reflectors: false,
    "steering lock": false,
    "wheel alignment front axle": false,
    "wheel alignment rear axle": false,
    "handle fixation": false,
    "disc brake alignment/fixation & oil": false,
    "suspension health front": false,
    "suspension health rear": false,
    "road test": false,
    "load test": false,
    "centre stand rubber": false,
    "all screws/bolts/nuts": false,
    breakage: false,
    packaging: false,
    "roof rubber beading (Y/N)": false,
  },
  addOns: {
    "foot mat": false,
    "rear view mirror": false,
    stepny: false,
    "CMVR card": false,
    "battery jumpers": false,
    battery: false,
    "remote/FM": false,
    "MCB wire": false,
    "service book": false,
    "number plate with nut/bolt": false,
    "battery clamp": false,
    accessory: false,
    toolkit: false,
    charger: false,
    "PDI sheet": false,
    "foot pedal cover": false,
  },
  bill_date: "",
};

// export const fields = {
//   bill_date: "",
//   bill_no: "",
//   remarks: "",
//   electricalSystems: [
//     "connections",
//     "power on/off switch",
//     "power on",
//     "speedo meter",
//     "display",
//     "indicator left",
//     "indicator right",
//     "stopper",
//     "brake indication",
//     "other indications",
//     "motor",
//     "head light",
//     "tail light",
//     "indicator flasher front",
//     "indicator flasher rear",
//     "indicator buzzer",
//     "horn",
//     "brake cut system",
//     "security/alarm system",
//     "battery",
//     "charger",
//     "on-off key 2 nos",
//     "side stand sensor",
//     "all switch functions",
//     "voltage connections",
//     "limit connections",
//     "controller health",
//     "converter health",
//     "wiring health",
//     "motor with wiper",
//   ],
//   mechanicalSystems: [
//     "plastic body parts fixation",
//     "tyre direction",
//     "tyre pressure front",
//     "tyre pressure rear",
//     "seat lock",
//     "throttle & left grip fittings",
//     "front & rear brake",
//     "motor unit performance",
//     "front direction",
//     "rear direction",
//     "stickers",
//     "paint/marks",
//     "reflectors",
//     "steering lock",
//     "wheel alignment front axle",
//     "wheel alignment rear axle",
//     "handle fixation",
//     "disc brake alignment/fixation & oil",
//     "suspension health front",
//     "suspension health rear",
//     "road test",
//     "load test",
//     "centre stand rubber",
//     "all screws/bolts/nuts",
//     "breakage",
//     "packaging",
//     "roof rubber beading (Y/N)",
//   ],
//   addOns: [
//     "foot mat",
//     "rear view mirror",
//     "stepny",
//     "CMVR card",
//     "battery jumpers",
//     "battery",
//     "remote/FM",
//     "MCB wire",
//     "service book",
//     "number plate with nut/bolt",
//     "battery clamp",
//     "accessory",
//     "toolkit",
//     "charger",
//     "PDI sheet",
//     "foot pedal cover",
//   ],
// };
