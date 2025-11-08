"use client";

import { Button } from "@/components/ui/button";

const BATTERY_TYPES = [
  {
    id: "lithium",
    label: "Lithium-ion",
    description: "High performance, longer lifespan",
  },
  {
    id: "lead-acid",
    label: "Lead-acid",
    description: "Budget-friendly option",
  },
  {
    id: "nickel-metal",
    label: "Nickel-Metal Hydride",
    description: "Reliable alternative",
  },
];

export default function BatteryTypeStep({ value, onChange }) {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Select Battery Type</h2>
      <p className="text-muted-foreground mb-6">
        Choose the battery type for your order item
      </p>

      <div className="grid gap-3">
        {BATTERY_TYPES.map((battery) => (
          <button
            key={battery.id}
            onClick={() => onChange(battery.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              value === battery.id
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="font-semibold">{battery.label}</div>
            <div className="text-muted-foreground text-sm">
              {battery.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
