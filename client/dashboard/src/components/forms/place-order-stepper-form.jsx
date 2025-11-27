"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import BatteryTypeStep from "./steps/battery-type-step";
import VehicleSelectionStep from "./steps/vehicle-selection-step";
import ColorSelectionStep from "./steps/color-selection-step";
// import VariantStep from "./steps/variant-step";

const STEPS = [
  { id: 1, name: "Vehicle", description: "Select vehicle(s)" },
  { id: 2, name: "Battery Type", description: "Select battery type" },
  { id: 3, name: "Color", description: "Choose color" },
];

export default function OrderItemStepper() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicles, setSelectedVehicles] = useState([]);

  const {
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      battery_type: "",
      vehicle_ids: [],
      color: {},
      variant: "",
      quantity: 1,
    },
  });

  const batteryType = watch("battery_type");
  const vehicleIds = watch("vehicle_ids");
  const color = watch("color");
  const variant = watch("variant");

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    console.log({
      battery_type: batteryType,
      vehicle_ids: vehicleIds,
      color, // { vehicleId1: "red", vehicleId2: "blue" }
      variant,
    });
  };

  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return !!batteryType;
      case 2:
        return vehicleIds.length > 0;
      case 3:
        return vehicleIds.length > 0 && vehicleIds.every((id) => color[id]);
      default:
        return false;
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex flex-1 items-center">
              <button
                onClick={() => setCurrentStep(step.id)}
                disabled={!isStepComplete(step.id) && step.id !== currentStep}
                className="group flex flex-col items-center"
              >
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : isStepComplete(step.id)
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isStepComplete(step.id) && currentStep !== step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.id
                  )}
                </div>
                <span className="text-center text-sm font-medium">
                  {step.name}
                </span>
              </button>

              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 mb-6 h-1 flex-1 rounded transition-colors ${
                    isStepComplete(step.id) ? "bg-green-500" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-8 p-8">
        {currentStep === 1 && (
          <BatteryTypeStep
            value={batteryType}
            onChange={(value) => setValue("battery_type", value)}
          />
        )}

        {currentStep === 2 && (
          <VehicleSelectionStep
            value={vehicleIds}
            onChange={(value) => setValue("vehicle_ids", value)}
          />
        )}

        {currentStep === 3 && vehicleIds.length > 0 && (
          <ColorSelectionStep
            vehicleIds={vehicleIds}
            value={color}
            onChange={(vehicleId, selectedColor) =>
              setValue("color", { ...color, [vehicleId]: selectedColor })
            }
          />
        )}

        {/* {currentStep === 4 && (
          <VariantStep
            value={variant}
            onChange={(value) => setValue("variant", value)}
          />
        )} */}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        {currentStep === STEPS.length ? (
          <Button onClick={handleSubmit} className="ml-auto">
            Submit
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isStepComplete(currentStep)}
            className="ml-auto"
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
