"use client";
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";

export default function OrderItemStepperForm({ vehicles = [], onSubmit }) {
  const [step, setStep] = useState(1);
  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      battery_type: "",
      vehicle_ids: [],
      colors: [],
      variant: "",
    },
  });

  const selectedVehicles = watch("vehicle_ids") || [];

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFormSubmit = (data) => {
    onSubmit?.(data);
  };

  const stepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="battery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <label className="mb-2 block font-medium">Battery Type</label>
            <Controller
              name="battery_type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select battery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lithium">Lithium</SelectItem>
                    <SelectItem value="lead-acid">Lead-Acid</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="vehicle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <label className="mb-2 block font-medium">Select Vehicles</label>
            <div className="grid grid-cols-2 gap-3">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center space-x-2 rounded-lg border p-3"
                >
                  <Controller
                    name="vehicle_ids"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value.includes(v.id)}
                        onCheckedChange={(checked) => {
                          const newValues = checked
                            ? [...field.value, v.id]
                            : field.value.filter((id) => id !== v.id);
                          field.onChange(newValues);
                        }}
                      />
                    )}
                  />
                  <span>{v.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="color"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <label className="mb-2 block font-medium">Select Colors</label>
            {selectedVehicles.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Select at least one vehicle first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {["Red", "Blue", "Black", "White", "Gray"].map((color) => (
                  <div
                    key={color}
                    className="flex items-center space-x-2 rounded-lg border p-3"
                  >
                    <Controller
                      name="colors"
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value.includes(color)}
                          onCheckedChange={(checked) => {
                            const newValues = checked
                              ? [...field.value, color]
                              : field.value.filter((c) => c !== color);
                            field.onChange(newValues);
                          }}
                        />
                      )}
                    />
                    <span>{color}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="variant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <label className="mb-2 block font-medium">Variant</label>
            <Controller
              name="variant"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Input {...field} placeholder="Enter variant name" />
              )}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="mx-auto mt-10 max-w-xl shadow-lg">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Step {step} of 4</h2>
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>

          {stepContent()}

          <div className="mt-6 flex justify-between">
            {step > 1 && (
              <Button type="button" variant="outline" onClick={prevStep}>
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button type="button" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button type="submit">Submit</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
