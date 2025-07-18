import { z } from "zod";

export const dealerInventorySchema = z.object({
  dealer_id: z
    .string({ required_error: "Dealer ID is required" })
    .uuid()
    .min(1, { message: "Dealer ID is required" }),
  vehicle_id: z
    .string({ required_error: "Vehicle ID is required" })
    .uuid()
    .min(1, { message: "Vehicle ID is required" }),
  chassis_numbers: z.array(z.string().uuid()),
});
