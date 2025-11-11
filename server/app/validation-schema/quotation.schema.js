import { z } from "zod";

export const quotationSchema = z.object({
  enquiry_id: z
    .string({ required_error: "Enquiry ID is required." })
    .uuid("Invalid enquiry ID."),
  customer_name: z.string().min(1, "Customer name is required."),
  mobile_no: z
    .string()
    .min(10, "Mobile number must be at least 10 digits.")
    .max(15, "Mobile number must not exceed 15 digits."),
  date: z.union([z.coerce.date(), z.null()]).default(null),
  vehicle_id: z.string().uuid(),
  vehicle_variant_map_id: z.string().uuid(),
  vehicle_color_id: z.string().uuid(),
  base_price_ex_showroom: z.string().optional(),
  gst: z.number().int().optional(),
  insurance: z.string().optional(),
  rto_registration_charges: z.string().optional(),
  accessories_fitments: z.string().optional(),
  total_ex_showroom_price: z.string().optional(),
  discount: z.string().optional(),
  on_road_price: z.string().optional(),
});
