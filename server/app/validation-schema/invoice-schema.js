import { z } from "zod";

export const invoiceSchema = z.object({
  customer_id: z
    .string()
    .uuid({ message: "Invalid customer ID" })
    .min(1, { message: "Select customer" }),
  vehicle_ids: z
    .array(z.string().uuid())
    .min(1, { message: "Select vehicle" })
    .default([]),
  // customer_name: z.string().min(1, "Customer name is required"),
  // mobile_no: z.string().min(10, "Enter valid mobile no."),
  date: z.union([z.coerce.date(), z.null()]).default(null),
  vehicle_price_breakups: z.array(
    z.object({
      model: z.string().min(1, { message: "Model name is required" }),
      base_price_ex_showroom: z.string().optional(),
      gst: z.coerce.number().optional(),
      insurance: z.string().min(1, { message: "Insurance is required." }),
      rto_registration_charges: z
        .string()
        .min(1, { message: "RTO registration charges is required." }),
      accessories_fitments: z.string().optional(),
      total_ex_showroom_price: z.string().optional(),
      discount: z.string().optional(),
      on_road_price: z.string().optional(),
    })
  ),
});
