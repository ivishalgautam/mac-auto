import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Button } from "./ui/button";

export default function MyStepper({
  currentStep,
  setCurrentStep,
  steps,
  children,
}) {
  return (
    <div className="space-y-8">
      <Stepper
        value={currentStep}
        onValueChange={setCurrentStep}
        className="items-start gap-4"
      >
        {steps.map(({ step, title }) => (
          <StepperItem key={step} step={step} className="flex-1">
            <StepperTrigger className="w-full flex-col items-start gap-2 rounded">
              <StepperIndicator asChild className="bg-border h-1 w-full">
                <span className="sr-only">{step}</span>
              </StepperIndicator>
              <div className="space-y-0.5">
                <StepperTitle className={"text-lg"}>{title}</StepperTitle>
              </div>
            </StepperTrigger>
          </StepperItem>
        ))}
      </Stepper>
      <div>{children}</div>
    </div>
  );
}
