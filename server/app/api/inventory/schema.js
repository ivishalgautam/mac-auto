import { z } from "zod";

export const inventorySchema = z.object({
  quantity: z
    .number({ required_error: "Quantity is required" })
    .min(0, { message: "Quantity is required" }),
  chassis_numbers: z.array(
    z.object({
      number: z
        .string({ required_error: "required*" })
        .min(1, { message: "required*" }),
    })
  ),
});
