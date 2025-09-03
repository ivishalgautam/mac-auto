import { z } from "zod";

// Schema for single model
export const singleVehicleVariantSchema = z.object({
  variant_name: z.string().min(1, { message: "Variant name is required." }),
});

// Schema for bulk models
export const bulkVehicleVariantSchema = z.object({
  variant_names: z
    .array(singleVehicleVariantSchema)
    .min(1, { message: "At least 1 variant name is required." }),
});
