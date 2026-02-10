import { z } from "zod";

export const partSchema = z.object({
  part_name: z
    .string({ required_error: "required*" })
    .min(1, "Name is required"),
});
