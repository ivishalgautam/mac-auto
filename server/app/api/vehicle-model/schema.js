import { z } from "zod";

// Schema for single model
export const singleVehicleModelSchema = z.object({
  model_name: z.string().min(1, { message: "Model name is required." }),
});

// Schema for bulk models
export const bulkVehicleModelSchema = z.object({
  model_names: z
    .array(singleVehicleModelSchema)
    .min(1, { message: "At least 1 model name is required." }),
});
