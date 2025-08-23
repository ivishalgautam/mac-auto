import { z } from "zod";

export const customerOrderSchema = z.object({
  customer_id: z
    .string({ required_error: "Dealer ID is required" })
    .uuid()
    .min(1, { message: "Dealer ID is required" }),
  vehicle_id: z
    .string({ required_error: "Vehicle is required" })
    .uuid()
    .min(1, { message: "Vehicle is required" }),
  vehicle_color_id: z
    .string({ required_error: "Vehicle color is required" })
    .uuid()
    .min(1, { message: "Vehicle vehicle is required" }),
  chassis_number: z
    .array(
      z.object({
        value: z.string().min(1, { message: "Chassis number is required." }),
        label: z.string().min(1, { message: "Chassis number is required." }),
      }),
    )
    .transform((data) => data[0].value),
});
