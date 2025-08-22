import { z } from "zod";

export const customerOrderSchema = z.object({
  customer_id: z
    .string({ required_error: "Dealer ID is required" })
    .uuid()
    .min(1, { message: "Dealer ID is required" }),
  vehicle_id: z
    .string({ required_error: "Vehicle ID is required" })
    .uuid()
    .min(1, { message: "Vehicle ID is required" }),
  vehicle_color_id: z
    .string({ required_error: "Vehicle color is required" })
    .uuid()
    .min(1, { message: "Vehicle color is required" }),
  chassis_number: z.string().min(1, { message: "Chassis number is required." }),
});
