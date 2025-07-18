import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import React from "react";
import { useFormContext } from "react-hook-form";

export default function EMICalculator() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-2">
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
        {/* <div className="space-y-2">
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
        </div> */}
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

      {/* <div className="grid grid-cols-3 gap-4">
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
      </div> */}
    </div>
  );
}
