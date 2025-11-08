"use client";

import { useEffect, useState } from "react";

const AVAILABLE_COLORS = [
  { id: "white", label: "Pearl White", hex: "#FFFFFF" },
  { id: "black", label: "Solid Black", hex: "#000000" },
  { id: "silver", label: "Silver Metallic", hex: "#C0C0C0" },
  { id: "red", label: "Solid Red", hex: "#E31E24" },
  { id: "blue", label: "Midnight Blue", hex: "#001A4D" },
  { id: "gray", label: "Midnight Silver", hex: "#808080" },
];

export default function ColorSelectionStep({ vehicleIds, value, onChange }) {
  const [colors] = useState(AVAILABLE_COLORS);

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Select Colors</h2>
      <p className="text-muted-foreground mb-6">
        Choose a color for each selected vehicle
      </p>

      <div className="space-y-8">
        {vehicleIds.map((vehicleId) => (
          <div key={vehicleId}>
            <h3 className="mb-3 text-lg font-medium">Vehicle #{vehicleId}</h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  onClick={() => onChange(vehicleId, color.id)}
                  className={`rounded-lg border-2 p-4 transition-all ${
                    value?.[vehicleId] === color.id
                      ? "border-primary ring-primary ring-2"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div
                    className="border-border mb-2 h-20 w-full rounded-md border shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="text-sm font-medium">{color.label}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
