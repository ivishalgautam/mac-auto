import { z } from "zod";

export const financerSchema = z.object({
  name: z
    .string({ required_error: "Financer name is required*" })
    .min(1, { message: "Financer name is required*" }),
  logo: z
    .array(z.string({ required_error: "Financer logo is required*" }))
    .min(1, { message: "Financer logo is required*" }),
  interest_percentage: z.number(),
  area_serve: z.array(
    z.object({
      state_code: z
        .string({ required_error: "State code is required*" })
        .min(1, { message: "State code is required*" }),
      state: z
        .string({ required_error: "State name is required*" })
        .min(1, { message: "State name is required*" }),
      city: z
        .array(z.object({ label: z.string(), value: z.string() }))
        .min(1, { message: "Atleast 1 city is required*" }),
    })
  ),
});
