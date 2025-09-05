import { z } from "zod";

export const dealerOrderSchema = z.object({
  dealer_id: z
    .string({ required_error: "Dealer ID is required" })
    .uuid()
    .min(1, { message: "Dealer ID is required" }),
  vehicle_id: z
    .string({ required_error: "Vehicle ID is required" })
    .uuid()
    .min(1, { message: "Vehicle ID is required" }),
  enquiry_id: z.string().optional(),
  vehicle_color_id: z
    .string({ required_error: "Vehicle color ID is required" })
    .uuid()
    .min(1, { message: "Vehicle color ID is required" }),
  vehicle_variant_map_id: z
    .string({ required_error: "Vehicle variant ID is required" })
    .uuid()
    .min(1, { message: "Vehicle variant ID is required" }),
  chassis_numbers: z.array(z.string()),
});
