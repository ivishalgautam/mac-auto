"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function VehicleSelectionStep({ value, onChange }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch vehicles from API
    const fetchVehicles = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/vehicles");
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error("Failed to fetch vehicles:", error);
        // Mock data for demo
        setVehicles([
          { id: "1", name: "Tesla Model 3", model: "2024" },
          { id: "2", name: "Tesla Model Y", model: "2024" },
          { id: "3", name: "Tesla Model S", model: "2024" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const toggleVehicle = (vehicleId) => {
    if (value.includes(vehicleId)) {
      onChange(value.filter((id) => id !== vehicleId));
    } else {
      onChange([...value, vehicleId]);
    }
  };

  if (loading) {
    return <div>Loading vehicles...</div>;
  }

  return (
    <div>
      <h2 className="mb-2 text-2xl font-semibold">Select Vehicles</h2>
      <p className="text-muted-foreground mb-6">
        Choose one or more vehicles for this order item
      </p>

      <div className="space-y-3">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="border-border hover:border-primary/50 flex items-center gap-3 rounded-lg border-2 p-4 transition-colors"
          >
            <Checkbox
              checked={value.includes(vehicle.id)}
              onCheckedChange={() => toggleVehicle(vehicle.id)}
              id={vehicle.id}
            />
            <label
              htmlFor={vehicle.id}
              className="flex-1 cursor-pointer font-medium"
            >
              <div>{vehicle.name}</div>
              <div className="text-muted-foreground text-sm">
                {vehicle.model}
              </div>
            </label>
          </div>
        ))}
      </div>

      {value.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <p className="text-muted-foreground mb-2 text-sm">
            Selected vehicles:
          </p>
          <div className="flex flex-wrap gap-2">
            {value.map((vehicleId) => {
              const vehicle = vehicles.find((v) => v.id === vehicleId);
              return (
                <Badge key={vehicleId} variant="secondary">
                  {vehicle?.name}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
