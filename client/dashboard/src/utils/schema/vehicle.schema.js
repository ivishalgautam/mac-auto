import { z } from "zod";

// Zod schema for VehicleModel
export const vehicleSchema = z.object({
  category: z.enum(["passenger", "cargo", "garbage"], {
    required_error: "Category is required!",
  }),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  vehicle_id: z.string().uuid().nullable().optional(),
  is_variant: z.boolean().default(false),
  colors: z
    .array(z.object({ label: z.string(), value: z.string() }))
    .min(1, { message: "Colors are required*" }),
  pricing: z
    .array(
      z.object({
        name: z
          .string({ required_error: "State name is required*" })
          .min(1, { message: "State name is required*" }),
        base_price: z
          .number({ required_error: "Base price is required*" })
          .min(1, { required_error: "Base price is required*" }),
        cities: z.array(
          z.object({
            name: z
              .string({ required_error: "City name is required*" })
              .min(1, { message: "City name is required*" }),
            price_modifier: z
              .number({ required_error: "Price modifier is required*" })
              .min(1, { required_error: "Price modifier is required*" }),
          }),
        ),
      }),
    )
    .nonempty("Pricing is required"),

  emi_calculator: z.object({
    default_values: z.object({
      down_payment: z.number(),
      loan_tenure: z.number(),
      interest_rate: z.number(),
    }),
    ranges: z.object({
      down_payment: z.object({
        min: z.number(),
        step: z.number(),
      }),
      loan_tenure: z.object({
        min: z.number(),
        max: z.number(),
        step: z.number(),
      }),
      interest_rate: z.object({
        min: z.number(),
        max: z.number(),
        step: z.number(),
      }),
    }),
    // financing_companies: z.array(
    //   z.object({
    //     id: z.string(),
    //     name: z.string(),
    //     interest_rate: z.number(),
    //     color: z.string(),
    //   }),
    // ),
  }),
});
