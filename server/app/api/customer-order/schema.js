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
  vehicle_variant_map_id: z
    .string({ required_error: "Vehicle variant is required" })
    .uuid()
    .min(1, { message: "Vehicle variant is required" }),
  booking_amount: z.coerce
    .number()
    .min(1, { message: "Booking amount is required." }),

  chassis_number: z.string().min(1, { message: "Chassis number is required." }),
});
