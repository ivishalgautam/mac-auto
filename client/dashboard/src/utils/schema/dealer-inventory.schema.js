import { z } from "zod";

export const dealerInventorySchema = z.object({
  dealer_id: z
    .string({ required_error: "Dealer ID is required" })
    .uuid({ message: "Select Dealer" })
    .min(1, { message: "Dealer ID is required" }),
  vehicle_id: z
    .string({ required_error: "Vehicle ID is required" })
    .uuid()
    .min(1, { message: "Vehicle ID is required" }),
  // quantity: z.number().min(1, { message: "Quantity is required!" }),
  chassis_numbers: z
    .array(
      z.object({
        value: z.string(),
        label: z.string(),
      }),
    )
    .nonempty({ message: "Select atleast 1 Chassis number*" })
    .transform((data) => data.map(({ value }) => value)),
});
