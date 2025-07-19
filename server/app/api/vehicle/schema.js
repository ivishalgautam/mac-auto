import { coerce, z } from "zod";

// Zod schema for VehicleModel
export const vehicleSchema = z.object({
  category: z.enum(["passenger", "cargo", "garbage"], {
    required_error: "Category is required!",
  }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  vehicle_id: z.string().uuid().nullable().optional(),
  is_variant: z.coerce.boolean().default(false),
  video_link: z.string().optional().default(null),
  color: z
    .string({ required_error: "Color is required!" })
    .min(1, { message: "Color is required!" }),
  quantity: z.coerce.number().default(0),
  chassis_numbers: z.array(
    z.object({
      number: z
        .string({ required_error: "required*" })
        .min(1, { message: "required*" }),
    })
  ),
  base_price: z.coerce.number().min(1, { message: "Base price is reuqired*" }),
  // pricing: z
  //   .array(
  //     z.object({
  //       name: z.string(),
  //       base_price: z.number(),
  //       cities: z.array(
  //         z.object({
  //           name: z.string(),
  //           price_modifier: z.number(),
  //         })
  //       ),
  //     })
  //   )
  //   .nonempty("Pricing is required"),

  // emi_calculator: z.object({
  //   default_values: z.object({
  //     down_payment: z.number(),
  //     loan_tenure: z.number(),
  //     interest_rate: z.number(),
  //   }),
  //   ranges: z.object({
  //     down_payment: z.object({
  //       min: z.number(),
  //       step: z.number(),
  //     }),
  //     loan_tenure: z.object({
  //       min: z.number(),
  //       max: z.number(),
  //       step: z.number(),
  //     }),
  //     interest_rate: z.object({
  //       min: z.number(),
  //       max: z.number(),
  //       step: z.number(),
  //     }),
  //   }),
  //   financing_companies: z.array(
  //     z.object({
  //       id: z.string(),
  //       name: z.string(),
  //       interest_rate: z.number(),
  //       color: z.string(),
  //     })
  //   ),
  // }),
});
export const vehicleUpdateSchema = z.object({
  category: z.enum(["passenger", "cargo", "garbage"], {
    required_error: "Category is required!",
  }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  vehicle_id: z.string().uuid().nullable().optional(),
  is_variant: z.coerce.boolean().default(false),
  color: z
    .string({ required_error: "Color is required!" })
    .min(1, { message: "Color is required!" }),
  video_link: z.string().optional().default(null),
  quantity: z.coerce.number().default(0),
  base_price: z.coerce.number().min(1, { message: "Base price is reuqired*" }),
  // pricing: z
  //   .array(
  //     z.object({
  //       name: z.string(),
  //       base_price: z.number(),
  //       cities: z.array(
  //         z.object({
  //           name: z.string(),
  //           price_modifier: z.number(),
  //         })
  //       ),
  //     })
  //   )
  //   .nonempty("Pricing is required"),

  // emi_calculator: z.object({
  //   default_values: z.object({
  //     down_payment: z.number(),
  //     loan_tenure: z.number(),
  //     interest_rate: z.number(),
  //   }),
  //   ranges: z.object({
  //     down_payment: z.object({
  //       min: z.number(),
  //       step: z.number(),
  //     }),
  //     loan_tenure: z.object({
  //       min: z.number(),
  //       max: z.number(),
  //       step: z.number(),
  //     }),
  //     interest_rate: z.object({
  //       min: z.number(),
  //       max: z.number(),
  //       step: z.number(),
  //     }),
  //   }),
  //   financing_companies: z.array(
  //     z.object({
  //       id: z.string(),
  //       name: z.string(),
  //       interest_rate: z.number(),
  //       color: z.string(),
  //     })
  //   ),
  // }),
});
